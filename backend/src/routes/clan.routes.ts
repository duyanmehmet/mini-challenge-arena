import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const LEAGUE_THRESHOLDS = [
  { name: "diamond", min: 50000 },
  { name: "gold",    min: 20000 },
  { name: "silver",  min: 5000  },
  { name: "bronze",  min: 0     },
];

function calcLeague(score: number): string {
  return LEAGUE_THRESHOLDS.find(l => score >= l.min)?.name ?? "bronze";
}

function genCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// ── Klan oluştur ─────────────────────────────────────────────────
router.post("/create", authMiddleware, async (req: AuthRequest, res) => {
  const { name, tag, description, type = "open" } = req.body;
  if (!name || !tag || name.length < 3 || tag.length < 2)
    return res.status(400).json({ message: "Klan adı 3+, etiket 2+ karakter olmalı." });
  if (!["open", "approved", "private"].includes(type))
    return res.status(400).json({ message: "Geçersiz klan türü." });

  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    if (user.clan_id) return res.status(400).json({ message: "Zaten bir klana üyesin." });

    // Seviye ve coin kontrolü
    if ((user.level ?? 1) < 5)
      return res.status(400).json({ message: "Klan kurmak için Seviye 5 gerekli." });
    if ((user.coins ?? 0) < 5000)
      return res.status(400).json({ message: "Klan kurmak için 5.000 coin gerekli." });

    const clanId   = uuidv4();
    const joinCode = type === "private" ? genCode() : null;

    await db("clans").insert({
      id: clanId, name, tag: tag.toUpperCase(), description,
      leader_id: req.userId, type, join_code: joinCode,
      max_members: 30, level_req: 5, coin_req: 5000,
      league: "bronze", weekly_score: 0, total_members: 1,
    });

    await db("users").where("id", req.userId).update({
      clan_id: clanId,
      clan_role: "leader",
      coins: db.raw("GREATEST(0, coins - 5000)"),
    });

    res.json({ clanId, joinCode, message: "Klan oluşturuldu!" });
  } catch {
    res.status(500).json({ message: "Klan adı veya etiketi zaten kullanımda." });
  }
});

// ── Klana katıl (açık & onaylı) ──────────────────────────────────
router.post("/join/:clanId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (user?.clan_id) return res.status(400).json({ message: "Zaten bir klana üyesin." });

    const clan = await db("clans").where("id", req.params.clanId).first();
    if (!clan) return res.status(404).json({ message: "Klan bulunamadı." });
    if (clan.type === "private")
      return res.status(403).json({ message: "Bu özel klan. Katılmak için kod gerekli." });

    const memberCount = await db("users").where("clan_id", clan.id).count("* as cnt").first();
    if (parseInt((memberCount as any)?.cnt ?? "0") >= (clan.max_members ?? 30))
      return res.status(400).json({ message: "Klan dolu (maksimum üye sayısına ulaşıldı)." });

    if (clan.type === "approved") {
      // İstek gönder
      const existing = await db("clan_join_requests")
        .where({ clan_id: clan.id, user_id: req.userId, status: "pending" }).first();
      if (existing) return res.status(400).json({ message: "Zaten bekleyen isteğin var." });

      const username = (await db("users").where("id", req.userId).select("username").first())?.username ?? "";
      await db("clan_join_requests").insert({
        id: uuidv4(), clan_id: clan.id, user_id: req.userId,
        username, status: "pending",
      });
      return res.json({ pending: true, message: "Katılma isteğin lider onayına gönderildi." });
    }

    // Açık klan — direkt katıl
    await db("users").where("id", req.userId).update({ clan_id: clan.id, clan_role: "member" });
    await db("clans").where("id", clan.id).increment("total_members", 1);
    res.json({ message: `${clan.name} klanına katıldın!` });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Kod ile katıl (özel klan) ────────────────────────────────────
router.post("/join-code", authMiddleware, async (req: AuthRequest, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: "Kod gerekli." });
  try {
    const user = await db("users").where("id", req.userId).first();
    if (user?.clan_id) return res.status(400).json({ message: "Zaten bir klana üyesin." });

    const clan = await db("clans").where("join_code", code.toUpperCase()).first();
    if (!clan) return res.status(404).json({ message: "Geçersiz kod." });

    const memberCount = await db("users").where("clan_id", clan.id).count("* as cnt").first();
    if (parseInt((memberCount as any)?.cnt ?? "0") >= (clan.max_members ?? 30))
      return res.status(400).json({ message: "Klan dolu." });

    await db("users").where("id", req.userId).update({ clan_id: clan.id, clan_role: "member" });
    await db("clans").where("id", clan.id).increment("total_members", 1);
    res.json({ message: `${clan.name} klanına katıldın!` });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Katılma isteklerini gör (lider/yardımcı) ────────────────────
router.get("/requests", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user?.clan_id) return res.status(403).json({ message: "Bir klana üye değilsin." });
    if (!["leader", "assistant"].includes(user.clan_role ?? ""))
      return res.status(403).json({ message: "Yetkin yok." });

    const requests = await db("clan_join_requests")
      .where({ clan_id: user.clan_id, status: "pending" })
      .orderBy("created_at", "asc");
    res.json(requests);
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── İsteği onayla / reddet ───────────────────────────────────────
router.post("/requests/:requestId/:action", authMiddleware, async (req: AuthRequest, res) => {
  const { action } = req.params;
  if (!["approve", "reject"].includes(action))
    return res.status(400).json({ message: "Geçersiz işlem." });
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!["leader", "assistant"].includes(user?.clan_role ?? ""))
      return res.status(403).json({ message: "Yetkin yok." });

    const request = await db("clan_join_requests")
      .where({ id: req.params.requestId, clan_id: user.clan_id, status: "pending" }).first();
    if (!request) return res.status(404).json({ message: "İstek bulunamadı." });

    if (action === "approve") {
      const clan = await db("clans").where("id", user.clan_id).first();
      const memberCount = await db("users").where("clan_id", user.clan_id).count("* as cnt").first();
      if (parseInt((memberCount as any)?.cnt ?? "0") >= (clan?.max_members ?? 30))
        return res.status(400).json({ message: "Klan dolu." });

      await db("users").where("id", request.user_id).update({ clan_id: user.clan_id, clan_role: "member" });
      await db("clans").where("id", user.clan_id).increment("total_members", 1);
    }

    await db("clan_join_requests").where("id", request.id).update({ status: action === "approve" ? "approved" : "rejected" });
    res.json({ message: action === "approve" ? "Üye kabul edildi." : "İstek reddedildi." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Rol değiştir (lider) ─────────────────────────────────────────
router.post("/role/:targetUserId", authMiddleware, async (req: AuthRequest, res) => {
  const { role } = req.body;
  if (!["assistant", "member"].includes(role))
    return res.status(400).json({ message: "Geçersiz rol." });
  try {
    const leader = await db("users").where("id", req.userId).first();
    const clan   = await db("clans").where("id", leader?.clan_id).first();
    if (clan?.leader_id !== req.userId) return res.status(403).json({ message: "Sadece lider rol değiştirebilir." });

    const target = await db("users").where({ id: req.params.targetUserId, clan_id: leader.clan_id }).first();
    if (!target) return res.status(404).json({ message: "Üye bulunamadı." });

    await db("users").where("id", req.params.targetUserId).update({ clan_role: role });
    res.json({ message: `${target.username} artık ${role === "assistant" ? "Yardımcı" : "Üye"}.` });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Klandan ayrıl ───────────────────────────────────────────────
router.post("/leave", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user?.clan_id) return res.status(400).json({ message: "Bir klana üye değilsin." });

    const clan = await db("clans").where("id", user.clan_id).first();
    if (clan?.leader_id === req.userId) {
      const next = await db("users").where("clan_id", user.clan_id).whereNot("id", req.userId)
        .orderBy("weekly_score", "desc").first();
      if (next) {
        await db("clans").where("id", user.clan_id).update({ leader_id: next.id });
        await db("users").where("id", next.id).update({ clan_role: "leader" });
      } else {
        await db("clan_join_requests").where("clan_id", user.clan_id).delete();
        await db("clans").where("id", user.clan_id).delete();
      }
    }

    await db("users").where("id", req.userId).update({ clan_id: null, clan_role: "member" });
    if (clan) await db("clans").where("id", clan.id).decrement("total_members", 1);
    res.json({ message: "Klandan ayrıldın." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Üye at ──────────────────────────────────────────────────────
router.post("/kick/:targetUserId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!["leader", "assistant"].includes(user?.clan_role ?? ""))
      return res.status(403).json({ message: "Yetkin yok." });

    const target = await db("users").where({ id: req.params.targetUserId, clan_id: user.clan_id }).first();
    if (!target) return res.status(404).json({ message: "Üye bulunamadı." });
    if (target.clan_role === "leader") return res.status(400).json({ message: "Lideri atamazsın." });

    await db("users").where("id", req.params.targetUserId).update({ clan_id: null, clan_role: "member" });
    await db("clans").where("id", user.clan_id).decrement("total_members", 1);
    res.json({ message: `${target.username} klandan atıldı.` });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Benim klanım ────────────────────────────────────────────────
router.get("/my", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where("id", req.userId).first();
    if (!user?.clan_id) return res.json({ clan: null, members: [] });

    const clan = await db("clans").where("id", user.clan_id).first();
    if (!clan) return res.json({ clan: null, members: [] });

    const members = await db("users").where("clan_id", user.clan_id)
      .select("id", "username", "avatar_id", "weekly_score", "level", "clan_role")
      .orderBy("weekly_score", "desc").limit(30);

    const totalScore = members.reduce((s: number, m: any) => s + (m.weekly_score ?? 0), 0);
    const league = calcLeague(totalScore);
    await db("clans").where("id", clan.id).update({ league, weekly_score: totalScore, total_members: members.length });

    const pendingCount = ["leader", "assistant"].includes(user.clan_role ?? "")
      ? await db("clan_join_requests").where({ clan_id: clan.id, status: "pending" }).count("* as cnt").first()
      : null;

    res.json({
      clan: {
        ...clan,
        member_count: members.length,
        weekly_score: totalScore,
        league,
        leader_username: members.find((m: any) => m.id === clan.leader_id)?.username ?? "—",
        pending_requests: parseInt((pendingCount as any)?.cnt ?? "0"),
        my_role: user.clan_role ?? "member",
      },
      members,
    });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Klan ara ────────────────────────────────────────────────────
router.get("/search", async (req, res) => {
  const q = req.query.q as string;
  if (!q) return res.status(400).json({ message: "Arama terimi gerekli." });
  try {
    const clans = await db("clans").where("name", "like", `%${q}%`)
      .orWhere("tag", "like", `%${q}%`).where("type", "!=", "private").limit(10);
    const result = await Promise.all(clans.map(async (c: any) => ({
      ...c,
      member_count: await db("users").where("clan_id", c.id).count("* as cnt").first().then((r: any) => parseInt(r?.cnt ?? "0")),
    })));
    res.json(result);
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Klan profili ────────────────────────────────────────────────
router.get("/:clanId", async (req, res) => {
  try {
    const clan = await db("clans").where("id", req.params.clanId).first();
    if (!clan) return res.status(404).json({ message: "Klan bulunamadı." });
    const members = await db("users").where("clan_id", req.params.clanId)
      .select("id", "username", "avatar_id", "weekly_score", "level", "clan_role")
      .orderBy("weekly_score", "desc").limit(30);
    res.json({ clan: { ...clan, join_code: undefined }, members });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Haftalık klan sıralaması ─────────────────────────────────────
router.get("/leaderboard/weekly", async (_req, res) => {
  try {
    const clans = await db("clans")
      .select("clans.id", "clans.name", "clans.tag", "clans.weekly_score", "clans.league")
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

// ── Klan sohbeti ────────────────────────────────────────────────
router.post("/chat/:clanId", authMiddleware, async (req: AuthRequest, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: "Mesaj boş olamaz." });
  if (message.length > 300) return res.status(400).json({ message: "Mesaj çok uzun." });
  try {
    const user = await db("users").where({ id: req.userId, clan_id: req.params.clanId }).first();
    if (!user) return res.status(403).json({ message: "Bu klanın üyesi değilsin." });
    await db("clan_messages").insert({
      id: uuidv4(), clan_id: req.params.clanId,
      user_id: req.userId, username: user.username,
      message: message.trim(),
    });
    res.json({ ok: true });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

router.get("/chat/:clanId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db("users").where({ id: req.userId, clan_id: req.params.clanId }).first();
    if (!user) return res.status(403).json({ message: "Bu klanın üyesi değilsin." });
    const messages = await db("clan_messages").where("clan_id", req.params.clanId)
      .orderBy("created_at", "desc").limit(50)
      .select("id", "user_id", "username", "message", "created_at");
    res.json(messages.reverse());
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

export default router;
