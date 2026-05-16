import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Klan oluştur
router.post("/create", authMiddleware, async (req: AuthRequest, res) => {
  const { name, tag, description } = req.body;
  if (!name || !tag || name.length < 3 || tag.length < 2) {
    return res.status(400).json({ message: "Klan adı 3+, etiket 2+ karakter olmalı." });
  }
  try {
    const exists = await db("users").where("id", req.userId).whereNotNull("clan_id").first();
    if (exists?.clan_id) return res.status(400).json({ message: "Zaten bir klana üyesin." });

    const clanId = uuidv4();
    await db("clans").insert({ id: clanId, name, tag: tag.toUpperCase(), description, leader_id: req.userId });
    await db("users").where("id", req.userId).update({ clan_id: clanId });
    res.json({ clanId, message: "Klan oluşturuldu!" });
  } catch { res.status(500).json({ message: "Klan adı veya etiketi zaten kullanımda." }); }
});

// Klana katıl
router.post("/join/:clanId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (user?.clan_id) return res.status(400).json({ message: "Zaten bir klana üyesin." });
    const clan = await db("clans").where("id", req.params.clanId).first();
    if (!clan) return res.status(404).json({ message: "Klan bulunamadı." });
    await db("users").where("id", req.userId).update({ clan_id: req.params.clanId });
    res.json({ message: `${clan.name} klanına katıldın!` });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Klandan ayrıl
router.post("/leave", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user?.clan_id) return res.status(400).json({ message: "Bir klana üye değilsin." });

    const clan = await db("clans").where("id", user.clan_id).first();

    // Lider ayrılıyorsa: başka üye varsa liderliği devret, yoksa klanı sil
    if (clan?.leader_id === req.userId) {
      const nextLeader = await db("users")
        .where("clan_id", user.clan_id)
        .whereNot("id", req.userId)
        .orderBy("weekly_score", "desc")
        .first();

      if (nextLeader) {
        await db("clans").where("id", user.clan_id).update({ leader_id: nextLeader.id });
      } else {
        // Son üye — klanı sil
        await db("clans").where("id", user.clan_id).delete();
      }
    }

    await db("users").where("id", req.userId).update({ clan_id: null });
    res.json({ message: "Klandan ayrıldın." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Üye at (sadece lider)
router.post("/kick/:targetUserId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const leader = await db("users").where("id", req.userId).first();
    if (!leader?.clan_id) return res.status(403).json({ message: "Bir klana üye değilsin." });

    const clan = await db("clans").where("id", leader.clan_id).first();
    if (clan?.leader_id !== req.userId) return res.status(403).json({ message: "Sadece lider üye atabilir." });
    if (req.params.targetUserId === req.userId) return res.status(400).json({ message: "Kendinizi atamazsınız." });

    const target = await db("users").where({ id: req.params.targetUserId, clan_id: leader.clan_id }).first();
    if (!target) return res.status(404).json({ message: "Üye bulunamadı." });

    await db("users").where("id", req.params.targetUserId).update({ clan_id: null });
    res.json({ message: `${target.username} klandan atıldı.` });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Kullanıcının klanı
router.get("/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user?.clan_id) return res.json({ clan: null, members: [] });

    const clan = await db("clans").where("id", user.clan_id).first();
    if (!clan) return res.json({ clan: null, members: [] });

    const members = await db("users")
      .where("clan_id", user.clan_id)
      .select("id", "username", "avatar_id", "weekly_score", "level")
      .orderBy("weekly_score", "desc")
      .limit(30);

    const leader = await db("users").where("id", clan.leader_id).select("username").first();

    res.json({
      clan: {
        ...clan,
        member_count: members.length,
        weekly_score: members.reduce((s: number, m: any) => s + (m.weekly_score ?? 0), 0),
        leader_username: leader?.username ?? "—",
      },
      members,
    });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Klan sohbeti — mesaj gönder
router.post("/chat/:clanId", authMiddleware, async (req: AuthRequest, res) => {
  const { message } = req.body;
  if (!message || String(message).trim().length === 0)
    return res.status(400).json({ message: "Mesaj boş olamaz." });
  if (String(message).length > 300)
    return res.status(400).json({ message: "Mesaj 300 karakterden uzun olamaz." });
  try {
    const user = await db("users").where({ id: req.userId, clan_id: req.params.clanId }).first();
    if (!user) return res.status(403).json({ message: "Bu klanın üyesi değilsin." });
    await db("clan_messages").insert({
      id: uuidv4(), clan_id: req.params.clanId,
      user_id: req.userId, username: user.username,
      message: String(message).trim(),
    });
    res.json({ ok: true });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Klan sohbeti — son 50 mesaj
router.get("/chat/:clanId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where({ id: req.userId, clan_id: req.params.clanId }).first();
    if (!user) return res.status(403).json({ message: "Bu klanın üyesi değilsin." });

    const messages = await db("clan_messages")
      .where("clan_id", req.params.clanId)
      .orderBy("created_at", "desc")
      .limit(50)
      .select("id", "user_id", "username", "message", "created_at");

    res.json(messages.reverse());
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Klan ara
router.get("/search", async (req, res) => {
  const q = req.query.q as string;
  if (!q) return res.status(400).json({ message: "Arama terimi gerekli." });
  const clans = await db("clans").where("name", "like", `%${q}%`).orWhere("tag", "like", `%${q}%`).limit(10);
  const result = await Promise.all(clans.map(async (c: any) => ({
    ...c,
    member_count: await db("users").where("clan_id", c.id).count("* as cnt").first().then((r: any) => parseInt(r?.cnt ?? "0")),
  })));
  res.json(result);
});

// Klan profili
router.get("/:clanId", async (req, res) => {
  try {
    const clan = await db("clans").where("id", req.params.clanId).first();
    if (!clan) return res.status(404).json({ message: "Klan bulunamadı." });
    const members = await db("users").where("clan_id", req.params.clanId)
      .select("id", "username", "avatar_id", "weekly_score", "level")
      .orderBy("weekly_score", "desc").limit(20);
    res.json({ clan, members });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Klan liderliği
router.get("/leaderboard/weekly", async (_req, res) => {
  try {
    const clans = await db("clans")
      .select("clans.id", "clans.name", "clans.tag", "clans.weekly_score")
      .count("users.id as member_count")
      .leftJoin("users", "users.clan_id", "clans.id")
      .groupBy("clans.id")
      .orderBy("clans.weekly_score", "desc")
      .limit(50);

    res.json(clans.map((c: any, i: number) => ({
      ...c,
      member_count: parseInt(c.member_count ?? "0"),
      rank: i + 1,
    })));
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

export default router;
