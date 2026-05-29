import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import db from "../database";
import { v4 as uuidv4 } from "uuid";
import { pushService } from "../services/push.service";

const router = Router();

// ── Konuşma listesi (her arkadaşla son mesaj) ────────────────────────
router.get("/conversations", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const uid = req.userId!;

    // Son mesajları arkadaş bazında çek
    const rows = await db.raw(`
      SELECT
        u.id        AS friend_id,
        u.username  AS friend_username,
        u.avatar_id AS friend_avatar,
        m.content   AS last_message,
        m.created_at AS last_at,
        m.sender_id,
        (SELECT COUNT(*) FROM messages m2
          WHERE m2.sender_id = u.id AND m2.receiver_id = ? AND m2.is_read = 0) AS unread
      FROM users u
      JOIN friendships f ON (
        (f.requester_id = ? AND f.receiver_id = u.id) OR
        (f.receiver_id = ? AND f.requester_id = u.id)
      )
      LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages
        WHERE (sender_id = ? AND receiver_id = u.id)
           OR (sender_id = u.id AND receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT 1
      )
      WHERE u.id != ? AND f.status = 'accepted'
      GROUP BY u.id
      ORDER BY last_at DESC
    `, [uid, uid, uid, uid, uid, uid]);

    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── İki kullanıcı arasındaki mesajlar ───────────────────────────────
router.get("/:friendId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const uid = req.userId!;
    const fid = req.params.friendId;

    const msgs = await db("messages")
      .where(function () {
        this.where({ sender_id: uid, receiver_id: fid })
          .orWhere({ sender_id: fid, receiver_id: uid });
      })
      .orderBy("created_at", "asc")
      .limit(100)
      .select("id", "sender_id", "receiver_id", "content", "is_read", "created_at");

    // Okunmamışları oku olarak işaretle
    await db("messages")
      .where({ sender_id: fid, receiver_id: uid, is_read: false })
      .update({ is_read: true });

    // Gönderen kullanıcı bilgilerini ekle
    const friend = await db("users")
      .where("id", fid)
      .select("id", "username", "avatar_id")
      .first();

    res.json({ messages: msgs, friend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Mesaj gönder ─────────────────────────────────────────────────────
router.post("/:friendId", authMiddleware, async (req: AuthRequest, res) => {
  const { content } = req.body;
  if (!content?.trim() || content.length > 500)
    return res.status(400).json({ message: "Geçersiz mesaj." });

  try {
    const uid = req.userId!;
    const fid = req.params.friendId;

    const msg = {
      id: uuidv4(),
      sender_id: uid,
      receiver_id: fid,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    await db("messages").insert(msg);

    // Alıcıya push bildirimi gönder
    const sender = await db("users").where("id", uid).select("username").first().catch(() => null);
    const receiver = await db("users").where("id", fid).select("push_token").first().catch(() => null);
    if (receiver?.push_token && sender) {
      pushService.sendToUser(
        receiver.push_token,
        `💬 ${sender.username}`,
        content.trim().substring(0, 80),
        { type: "message", senderId: uid }
      ).catch(() => {});
    }

    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Tek mesaj sil ───────────────────────────────────────────────────
router.delete("/:messageId/single", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const uid = req.userId!;
    const mid = req.params.messageId;
    await db("messages").where({ id: mid, sender_id: uid }).delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Konuşmayı sil (iki taraf arası tüm mesajlar) ─────────────────────
router.delete("/conversation/:friendId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const uid = req.userId!;
    const fid = req.params.friendId;
    await db("messages")
      .where(function () {
        this.where({ sender_id: uid, receiver_id: fid })
          .orWhere({ sender_id: fid, receiver_id: uid });
      })
      .delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Okunmamış mesaj sayısı ───────────────────────────────────────────
router.get("/unread/count", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const row = await db("messages")
      .where({ receiver_id: req.userId!, is_read: false })
      .count("* as cnt")
      .first();
    res.json({ count: parseInt((row as any)?.cnt ?? "0") });
  } catch {
    res.json({ count: 0 });
  }
});

export default router;
