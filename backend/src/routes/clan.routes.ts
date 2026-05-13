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

// Kullanıcının klanı
router.get("/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user?.clan_id) return res.json({ clan: null, members: [] });

    const clan = await db("clans").where("id", user.clan_id).first();
    if (!clan) return res.json({ clan: null, members: [] });

    const members = await db("users")
      .where("clan_id", user.clan_id)
      .select("username", "avatar_id", "weekly_score", "level")
      .orderBy("weekly_score", "desc")
      .limit(30);

    const leader = await db("users").where("id", clan.leader_id).select("username").first();

    res.json({
      clan: {
        ...clan,
        member_count: members.length,
        weekly_score: members.reduce((s: number, m: any) => s + (m.weekly_score ?? 0), 0),
        leader_username: leader?.username ?? '—',
      },
      members,
    });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Klan ara
router.get("/search", async (req, res) => {
  const q = req.query.q as string;
  if (!q) return res.status(400).json({ message: "Arama terimi gerekli." });
  const clans = await db("clans").where("name", "like", `%${q}%`).orWhere("tag", "like", `%${q}%`).limit(10);
  const result = await Promise.all(clans.map(async (c: any) => ({
    ...c,
    memberCount: await db("users").where("clan_id", c.id).count("* as cnt").first().then((r: any) => parseInt(r?.cnt ?? "0")),
  })));
  res.json(result);
});

// Klan profili
router.get("/:clanId", async (req, res) => {
  try {
    const clan = await db("clans").where("id", req.params.clanId).first();
    if (!clan) return res.status(404).json({ message: "Klan bulunamadı." });
    const members = await db("users").where("clan_id", req.params.clanId)
      .select("id","username","avatar_id","weekly_score","level")
      .orderBy("weekly_score","desc").limit(20);
    res.json({ clan, members });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// Klan liderliği
router.get("/leaderboard/weekly", async (_req, res) => {
  const clans = await db("clans")
    .select("id","name","tag","weekly_score")
    .orderBy("weekly_score","desc").limit(50);
  res.json(clans.map((c: any, i: number) => ({ ...c, rank: i + 1 })));
});

export default router;