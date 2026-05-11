import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// ── Arkadaş arama ──
router.get("/search", authMiddleware, async (req: AuthRequest, res) => {
  const q = req.query.q as string;
  if (!q || q.length < 3) return res.status(400).json({ message: "En az 3 karakter girin." });
  try {
    const users = await db("users")
      .where("username", "like", `%${q}%`)
      .whereNot("id", req.userId)
      .select("id","username","avatar_id")
      .limit(10);
    res.json(users);
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Arkadaş listesi ──
router.get("/friends", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const uid = req.userId!;
    const fships = await db("friendships")
      .where((b: any) => b.where("requester_id", uid).orWhere("receiver_id", uid))
      .where("status", "accepted");
    const friendIds = fships.map((f: any) =>
      f.requester_id === uid ? f.receiver_id : f.requester_id);
    const friends = await db("users")
      .whereIn("id", friendIds)
      .select("id","username","avatar_id","weekly_score","current_league");
    res.json(friends.map((f: any) => ({
      userId: f.id, username: f.username, avatarId: f.avatar_id,
      weeklyScore: f.weekly_score, league: f.current_league,
    })));
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── İstek gönder ──
router.post("/request", authMiddleware, async (req: AuthRequest, res) => {
  const { receiverId } = req.body;
  if (!receiverId || receiverId === req.userId)
    return res.status(400).json({ message: "Geçersiz kullanıcı." });
  try {
    const exists = await db("friendships")
      .where({ requester_id: req.userId, receiver_id: receiverId }).first();
    if (exists) return res.status(409).json({ message: "İstek zaten gönderildi." });
    await db("friendships").insert({ id: uuidv4(), requester_id: req.userId, receiver_id: receiverId });
    res.json({ message: "İstek gönderildi." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Gelen istekler ──
router.get("/requests", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const reqs = await db("friendships")
      .where({ receiver_id: req.userId, status: "pending" })
      .join("users", "users.id", "friendships.requester_id")
      .select("friendships.id as friendship_id","users.id as user_id","users.username","users.avatar_id");
    res.json(reqs);
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── İstek kabul / reddet ──
router.post("/accept", authMiddleware, async (req: AuthRequest, res) => {
  const { friendshipId } = req.body;
  try {
    await db("friendships").where({ id: friendshipId, receiver_id: req.userId }).update({ status: "accepted" });
    res.json({ message: "İstek kabul edildi." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

router.post("/reject", authMiddleware, async (req: AuthRequest, res) => {
  const { friendshipId } = req.body;
  try {
    await db("friendships").where({ id: friendshipId, receiver_id: req.userId }).delete();
    res.json({ message: "İstek reddedildi." });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

// ── Düello başlat ──
router.post("/duel", authMiddleware, async (req: AuthRequest, res) => {
  const { friendId, mode } = req.body;
  const MODES = ["reflex","memory","football","word","attention","escape"];
  if (!friendId || !MODES.includes(mode)) return res.status(400).json({ message: "Geçersiz veri." });
  try {
    const duelId = uuidv4();
    await db("duels").insert({ id: duelId, challenger_id: req.userId, opponent_id: friendId, mode });
    res.json({ duelId });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

export default router;