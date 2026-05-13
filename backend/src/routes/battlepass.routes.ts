import { Router } from 'express';
import db from '../database';
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const TIERS = [
  { tier: 1,  xpRequired: 0,    reward: '50 Coin',                  rewardType: 'coins',  coins: 50  },
  { tier: 2,  xpRequired: 100,  reward: '100 Coin',                 rewardType: 'coins',  coins: 100 },
  { tier: 3,  xpRequired: 200,  reward: 'Özel Avatar: Kahraman',    rewardType: 'avatar', coins: 0   },
  { tier: 4,  xpRequired: 350,  reward: '150 Coin',                 rewardType: 'coins',  coins: 150 },
  { tier: 5,  xpRequired: 500,  reward: '"Bilge" Unvanı',           rewardType: 'title',  coins: 0   },
  { tier: 6,  xpRequired: 700,  reward: '200 Coin',                 rewardType: 'coins',  coins: 200 },
  { tier: 7,  xpRequired: 900,  reward: 'Özel Rozet: Yıldız',      rewardType: 'badge',  coins: 0   },
  { tier: 8,  xpRequired: 1200, reward: '300 Coin',                 rewardType: 'coins',  coins: 300 },
  { tier: 9,  xpRequired: 1500, reward: 'Özel Avatar: Kral',        rewardType: 'avatar', coins: 0   },
  { tier: 10, xpRequired: 2000, reward: '"Efsane" Unvanı + 500 Coin', rewardType: 'title', coins: 500 },
];

const SEASON_NAME = 'Sezon 1 — Başlangıç';
const SEASON_ENDS = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

/** Kullanıcının sezon XP'sine göre tier hesapla */
function calcTier(seasonXp: number): number {
  let tier = 0;
  for (const t of TIERS) {
    if (seasonXp >= t.xpRequired) tier = t.tier;
    else break;
  }
  return tier;
}

router.get('/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await db('users').where('id', req.userId).first();
    const seasonXp = user?.xp ?? 0;
    const currentTier = calcTier(seasonXp);

    // Hangi tier'lar talep edildi?
    const claimed = await db('battlepass_claims')
      .where('user_id', req.userId)
      .select('tier');
    const claimedTiers = new Set(claimed.map((c: any) => c.tier));

    const tiers = TIERS.map((t) => ({
      ...t,
      claimed: claimedTiers.has(t.tier),
    }));

    res.json({ seasonXp, currentTier, tiers, seasonName: SEASON_NAME, seasonEndsAt: SEASON_ENDS });
  } catch { res.status(500).json({ message: 'Sunucu hatası.' }); }
});

router.post('/claim', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tier } = req.body;
    const tierDef = TIERS.find((t) => t.tier === tier);
    if (!tierDef) return res.status(400).json({ message: 'Geçersiz tier.' });

    const user = await db('users').where('id', req.userId).first();
    const currentTier = calcTier(user?.xp ?? 0);
    if (currentTier < tier) return res.status(400).json({ message: 'Bu tier henüz açılmadı.' });

    const already = await db('battlepass_claims').where({ user_id: req.userId, tier }).first();
    if (already) return res.status(400).json({ message: 'Bu ödül zaten alındı.' });

    await db('battlepass_claims').insert({ user_id: req.userId, tier, claimed_at: new Date().toISOString() });

    if (tierDef.coins > 0) {
      await db('users').where('id', req.userId).increment('coins', tierDef.coins);
    }

    res.json({ success: true, message: `${tierDef.reward} hesabına eklendi!`, coins: tierDef.coins });
  } catch { res.status(500).json({ message: 'Sunucu hatası.' }); }
});

export default router;
