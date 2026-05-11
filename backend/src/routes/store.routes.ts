import { Router } from "express";
import db from "../database";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.get("/packages", (_req, res) => {
  const pkgs = [
    { id: "coins_500",  coins: 500,  amount: 500,  price: "19",  label: "Küçük Paket" },
    { id: "coins_1200", coins: 1200, amount: 1200, price: "39",  label: "Orta Paket",  popular: true },
    { id: "coins_3000", coins: 3000, amount: 3000, price: "79",  label: "Büyük Paket" },
    { id: "vip_30",     coins: 1000, amount: 1000, price: "99",  label: "VIP 30 Gün", premiumDays: 30 },
    { id: "noads",      coins: 0,    amount: 0,    price: "49",  label: "Reklamsız" },
  ];
  res.json(pkgs);
});

router.post("/purchase", authMiddleware, async (req: AuthRequest, res) => {
  const { packageId, receipt } = req.body;
  if (!receipt) return res.status(400).json({ message: "Receipt gerekli." });
  const COINS: Record<string, number> = { coins_500: 500, coins_1200: 1200, coins_3000: 3000, vip_30: 1000, noads: 0 };
  const coins = COINS[packageId];
  if (coins === undefined) return res.status(400).json({ message: "Geçersiz paket." });
  try {
    await db("users").where("id", req.userId).update({ coins: db.raw("coins + ?", [coins]) });
    res.json({ success: true, coinsAdded: coins });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

router.post("/spend", authMiddleware, async (req: AuthRequest, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "Geçersiz miktar." });
  try {
    const user = await db("users").where("id", req.userId).first();
    if ((user?.coins ?? 0) < amount) return res.status(400).json({ message: "Yetersiz coin." });
    await db("users").where("id", req.userId).update({ coins: db.raw("coins - ?", [amount]) });
    res.json({ success: true, remaining: user.coins - amount });
  } catch { res.status(500).json({ message: "Sunucu hatası." }); }
});

export default router;