import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { CATEGORIES } from '../../src/constants/categories';
import { gameService } from '../../src/services/game.service';
import { assetService } from '../../src/services/asset.service';
import api from '../../src/services/api';
import { admobService } from '../../src/services/admob.service';
import { Share } from 'react-native';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GOLD  = '#f59e0b';

/* ── Animasyonlu tek yıldız ── */
function AnimStar({ size, top, left, right, bottom, delay, emoji = '⭐' }: {
  size: number; top?: number; left?: number; right?: number; bottom?: number;
  delay: number; emoji?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const scale   = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        fontSize: size,
        top, left, right, bottom,
        transform: [{ scale }],
        opacity,
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

/* ── Yıldız kümesi (kupa etrafında) ── */
function TrophyWithStars() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 900, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,  duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={tw.wrap}>
      {/* Yıldızlar */}
      <AnimStar size={20} top={0}   left={10}  delay={0}   emoji="⭐" />
      <AnimStar size={14} top={10}  right={8}  delay={200} emoji="✨" />
      <AnimStar size={18} top={35}  left={0}   delay={400} emoji="⭐" />
      <AnimStar size={12} top={50}  right={2}  delay={600} emoji="✨" />
      <AnimStar size={16} bottom={30} left={15}  delay={300} emoji="⭐" />
      <AnimStar size={13} bottom={20} right={10} delay={500} emoji="✨" />
      <AnimStar size={15} top={5}   left={55}  delay={100} emoji="⭐" />
      <AnimStar size={11} bottom={35} left={60}  delay={700} emoji="✨" />

      {/* Kupa */}
      <Animated.Text style={[tw.trophy, { transform: [{ translateY: bounceAnim }] }]}>
        🏆
      </Animated.Text>
    </View>
  );
}

const tw = StyleSheet.create({
  wrap: {
    width: 180, height: 180,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  trophy: { fontSize: 100, zIndex: 2 },
});

/* ── Ana Ekran ── */
export default function ResultScreen() {
  const { mode, score, maxCombo, duration, challengeId, ligMode, ligFailed, antrenmanMode } = useLocalSearchParams<{
    mode: string; score: string; maxCombo: string; duration: string;
    challengeId?: string; ligMode?: string; ligFailed?: string; antrenmanMode?: string;
  }>();
  const isAntrenman = antrenmanMode === '1';
  const { personalBests, setPersonalBests, addXP, addCoins, updateUser, incrementCategoryPlayCount } = useUserStore();

  const numScore    = parseInt(score    ?? '0');
  const numCombo    = parseInt(maxCombo ?? '0');
  const numDuration = parseInt(duration ?? '0');
  const modeCfg     = CATEGORIES.find(m => m.id === mode);
  const prevBest    = personalBests.find(p => p.mode === mode);
  const isLig       = ligMode === '1';
  const isLigFailed = ligFailed === '1';
  const isNewRecord = !prevBest || numScore > prevBest.score;
  const xpEarned    = 10 + (isNewRecord ? 25 : 0);
  const coinsEarned = Math.floor(numScore / 100) + 5;

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;
  const [displayScore,    setDisplayScore]    = useState(0);
  const [ligResult,       setLigResult]       = useState<any>(null);
  const [challengeResult, setChallengeResult] = useState<{ rank: number; xpBonus: number } | null>(null);

  useEffect(() => {
    const lid = counterAnim.addListener(({ value }) => setDisplayScore(Math.round(value)));

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(counterAnim, { toValue: numScore, duration: 1500, useNativeDriver: false }),
    ]).start();

    if (!isLigFailed && !isAntrenman) {
      addXP(xpEarned);
      addCoins(coinsEarned);
    }
    if (mode) incrementCategoryPlayCount(mode);

    // Reklam — lig: her 2 oyunda 1, antrenman: her 3 oyunda 1
    if (!isLigFailed) {
      if (isLig)       admobService.maybeShowInterstitial('lig').catch(() => {});
      if (isAntrenman) admobService.maybeShowInterstitial('antrenman').catch(() => {});
    }

    if (!isLigFailed && isNewRecord) {
      assetService.playSound('levelup');
      const updated = personalBests.filter(p => p.mode !== mode);
      setPersonalBests([...updated, { mode: mode ?? '', score: numScore, achievedAt: new Date().toISOString() }]);
    }

    if (challengeId) {
      api.post('/challenge/submit', { challengeId, score: numScore })
        .then(r => setChallengeResult({ rank: r.data.rank, xpBonus: r.data.xpBonus }))
        .catch(() => {});
    }
    // Lig: sadece başarılıysa gönder (3 retry)
    if (isLig && !isLigFailed) {
      const submitLig = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const r = await api.post('/lig/submit', { score: numScore, categoryId: mode });
            setLigResult(r.data);
            return;
          } catch {
            if (i < retries - 1) await new Promise(r => setTimeout(r, 1500 * (i + 1)));
          }
        }
      };
      submitLig();
    }

    const submit = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await gameService.submitResult({
            mode: mode ?? '', score: numScore,
            duration_seconds: numDuration, combo_max: numCombo,
          });
          if (res?.streakCount !== undefined) updateUser({ streakCount: res.streakCount });
          if (res?.newLevel)                  updateUser({ level: res.newLevel });
          if (res?.badgesUnlocked?.length)    assetService.playSound('win');
          return;
        } catch {
          if (i < retries - 1) await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        }
      }
    };
    if (!isLigFailed) submit();

    return () => counterAnim.removeListener(lid);
  }, []);

  const handleShare = async () => {
    const cat = modeCfg?.name ?? 'Quiz';
    const rec = isNewRecord ? ' 🏆 Yeni rekor!' : '';
    try {
      await Share.share({
        message: `${cat} kategorisinde ${numScore.toLocaleString('tr-TR')} puan yaptım!${rec}\n\nMini Challenge Arena'da beni geçebilir misin? ⚡`,
      });
    } catch {}
  };

  // ── Antrenman Sonuç Ekranı ──────────────────────────────────────────
  if (isAntrenman) {
    const catColor = modeCfg?.color ?? '#6c3aed';
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={{ paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center' }}>

            {/* Geri */}
            <TouchableOpacity
              style={{ alignSelf: 'flex-start', marginTop: 12, marginBottom: 8 }}
              onPress={() => router.replace('/antrenman' as any)}
            >
              <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' }}>← Kategoriler</Text>
            </TouchableOpacity>

            {/* Kategori ikonu */}
            <View style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: catColor + '20', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 10 }}>
              <Text style={{ fontSize: 48 }}>{modeCfg?.icon ?? '📚'}</Text>
            </View>
            <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: '#111827', marginBottom: 4 }}>
              {modeCfg?.name ?? 'Antrenman'} Bitti!
            </Text>
            <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 13, color: '#9ca3af', marginBottom: 20, textAlign: 'center' }}>
              15 soruyu tamamladın. Tekrar oynayarak gelişebilirsin!
            </Text>

            {/* Puan kartı */}
            <View style={{ backgroundColor: catColor, borderRadius: 22, padding: 24, width: '100%', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito-Regular' }}>Toplam Puan</Text>
              <Animated.Text style={{ color: '#fff', fontSize: 56, fontFamily: 'Nunito-ExtraBold', lineHeight: 64 }}>
                {displayScore.toLocaleString('tr-TR')}
              </Animated.Text>
              {isNewRecord && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 8 }}>
                  <Text style={{ color: '#fff', fontFamily: 'Nunito-ExtraBold', fontSize: 13 }}>🏆 Yeni Rekor!</Text>
                </View>
              )}
            </View>

            {/* İstatistik kutucukları */}
            <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 }}>
              <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' }}>
                <Text style={{ fontSize: 20, fontFamily: 'Nunito-ExtraBold', color: '#f59e0b' }}>x{numCombo}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Nunito-Regular', marginTop: 3 }}>Max Kombo</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' }}>
                <Text style={{ fontSize: 20, fontFamily: 'Nunito-ExtraBold', color: '#22c55e' }}>{numDuration}sn</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Nunito-Regular', marginTop: 3 }}>Süre</Text>
              </View>
              {prevBest && (
                <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' }}>
                  <Text style={{ fontSize: 15, fontFamily: 'Nunito-ExtraBold', color: '#6c3aed' }}>{prevBest.score.toLocaleString('tr-TR')}</Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Nunito-Regular', marginTop: 3 }}>Rekor</Text>
                </View>
              )}
            </View>

            {/* Butonlar */}
            <TouchableOpacity
              style={{ backgroundColor: '#6c3aed', borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center', marginBottom: 10 }}
              onPress={() => router.replace({ pathname: `/game/${mode}` as any, params: { antrenmanMode: '1' } })}
            >
              <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' }}>🔄 Tekrar Oyna</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
              onPress={() => router.replace('/antrenman' as any)}
            >
              <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#374151' }}>Kategori Değiştir</Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Lig Başarısız Ekranı ─────────────────────────────────────────────
  if (isLig && isLigFailed) {
    const handleWatchAd = async () => {
      await admobService.showRewarded(async () => {
        await api.post('/lig/revive').catch(() => {});
      });
      router.replace('/lig' as any);
    };

    const handleRefillHearts = async () => {
      const { user } = useUserStore.getState();
      if ((user?.coins ?? 0) < 250) {
        Alert.alert('Yetersiz Altın', '5 kalbi doldurmak için 250 🪙 gerekli.');
        return;
      }
      try {
        const res = await api.post('/lig/refill-hearts');
        updateUser({ coins: res.data.coins });
        router.replace('/lig' as any);
      } catch (e: any) {
        Alert.alert('Hata', e?.response?.data?.message ?? 'İşlem başarısız.');
      }
    };

    return (
      <SafeAreaView style={fs.root}>
        {['❤️','💕','❤️','💗','❤️'].map((h, i) => (
          <Animated.Text key={i} style={[fs.floatHeart, {
            left: `${10 + i * 20}%` as any,
            top: `${5 + (i % 3) * 8}%` as any,
            opacity: 0.15,
            fontSize: 16 + (i % 3) * 8,
          }]}>{h}</Animated.Text>
        ))}

        <Animated.View style={[fs.wrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          <Text style={fs.emoji}>💔</Text>
          <Text style={fs.title}>Üzgünüm! 💔</Text>
          <Text style={fs.sub}>Tüm kalplerin bitti.</Text>

          <View style={fs.cards}>

            {/* Reklam İzle — 1 kalp */}
            <TouchableOpacity style={fs.card} onPress={handleWatchAd} activeOpacity={0.85}>
              <View style={fs.cardIconWrap}>
                <Text style={{ fontSize: 22 }}>▶️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={fs.cardTitle}>Reklam İzle</Text>
                <Text style={fs.cardSub}>1 kalp kazan</Text>
              </View>
              <View style={fs.badge}>
                <Text style={fs.badgeTxt}>Ücretsiz</Text>
              </View>
            </TouchableOpacity>

            {/* 5 Kalbi Anında Doldur — 250 coin */}
            <TouchableOpacity style={[fs.card, fs.cardHighlight]} onPress={handleRefillHearts} activeOpacity={0.85}>
              <View style={[fs.cardIconWrap, { backgroundColor: '#fef3c7' }]}>
                <Text style={{ fontSize: 22 }}>❤️‍🔥</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={fs.cardTitle}>5 Kalbi Doldur</Text>
                <Text style={fs.cardSub}>Anında 5 kalp kazan</Text>
              </View>
              <View style={fs.coinBadge}>
                <Text style={{ fontSize: 14 }}>🪙</Text>
                <Text style={fs.coinBadgeTxt}>250</Text>
              </View>
            </TouchableOpacity>

            {/* Biraz Bekle */}
            <TouchableOpacity style={fs.card} onPress={() => router.replace('/lig' as any)} activeOpacity={0.85}>
              <View style={fs.cardIconWrap}>
                <Text style={{ fontSize: 22 }}>⏱️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={fs.cardTitle}>Biraz Bekle</Text>
                <Text style={fs.cardSub}>2 saatte 1 kalp yenilenir</Text>
              </View>
              <View style={fs.badge}>
                <Text style={fs.badgeTxt}>Bekle</Text>
              </View>
            </TouchableOpacity>

          </View>

          <TouchableOpacity style={fs.homeBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
            <Text style={fs.homeBtnTxt}>Ana Sayfa</Text>
          </TouchableOpacity>

        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* 2x Bonus badge — sadece lig modunda */}
        {isLig && ligResult?.isWeekCat && (
          <Animated.View style={[s.recordBadge, { transform: [{ scale: scaleAnim }], borderColor: '#f59e0b', backgroundColor: '#f59e0b22' }]}>
            <Text style={[s.recordTxt, { color: '#f59e0b' }]}>⭐ 2X PUAN BONUS!</Text>
          </Animated.View>
        )}

        {/* Lig yeni rekor badge */}
        {isLig && ligResult?.isNewBest && (
          <View style={[s.recordBadge, { borderColor: '#22c55e', backgroundColor: '#22c55e22' }]}>
            <Text style={[s.recordTxt, { color: '#22c55e' }]}>🏆 YENİ LİG REKORU!</Text>
          </View>
        )}

        {/* Yeni Rekor badge */}
        {!isLig && isNewRecord && (
          <Animated.View style={[s.recordBadge, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={s.recordTxt}>🏆 YENİ REKOR!</Text>
          </Animated.View>
        )}

        {/* Kupa + Yıldızlar */}
        <TrophyWithStars />

        {/* Tebrikler */}
        <Text style={s.congrats}>Tebrikler!</Text>
        <Text style={s.sub}>Oyunu tamamladın.</Text>

        {/* Puan */}
        <Text style={s.puaninLabel}>Puanın</Text>
        <Animated.Text style={[s.scoreNum, { transform: [{ scale: scaleAnim }] }]}>
          {displayScore.toLocaleString('tr-TR')}
        </Animated.Text>

        {/* Coin ödülü */}
        <View style={s.coinRow}>
          <Text style={s.coinPlus}>+{coinsEarned}</Text>
          <Text style={{ fontSize: 18 }}>🪙</Text>
        </View>

        {/* Challenge sonuç kartı */}
        {!!challengeId && challengeResult && (
          <View style={[s.ligCard, { borderColor: '#06b6d440', marginBottom: 12 }]}>
            <View style={s.ligRow}>
              <Text style={s.ligLabel}>Günlük Sıran</Text>
              <Text style={[s.ligVal, { color: '#06b6d4' }]}>#{challengeResult.rank}. sıra</Text>
            </View>
            <View style={s.ligDivider} />
            <View style={s.ligRow}>
              <Text style={s.ligLabel}>XP Kazandın</Text>
              <Text style={[s.ligVal, { color: '#22c55e' }]}>+{challengeResult.xpBonus} XP</Text>
            </View>
            {challengeResult.xpBonus >= 100 && (
              <>
                <View style={s.ligDivider} />
                <View style={s.ligRow}>
                  <Text style={s.ligLabel}>Hedef</Text>
                  <Text style={[s.ligVal, { color: '#f59e0b' }]}>✅ Geçildi!</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Lig sonuç kartı */}
        {isLig && ligResult && (
          <View style={s.ligCard}>
            <View style={s.ligRow}>
              <Text style={s.ligLabel}>Lig Sıran</Text>
              <Text style={s.ligVal}>#{ligResult.newRank}. sıra</Text>
            </View>
            <View style={s.ligDivider} />
            <View style={s.ligRow}>
              <Text style={s.ligLabel}>Haftalık En İyi</Text>
              <Text style={[s.ligVal, { color: '#f59e0b' }]}>
                {ligResult.newWeeklyScore?.toLocaleString('tr-TR')} puan
              </Text>
            </View>
            {ligResult.isWeekCat && (
              <>
                <View style={s.ligDivider} />
                <View style={s.ligRow}>
                  <Text style={s.ligLabel}>Çarpan</Text>
                  <Text style={[s.ligVal, { color: '#f59e0b' }]}>x2 ⭐</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Buton */}
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={s.primaryBtnTxt}>Ana Sayfa</Text>
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  inner: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingBottom: 20,
  },

  // Yeni rekor
  recordBadge: {
    backgroundColor: GOLD + '22', borderRadius: 20,
    borderWidth: 1.5, borderColor: GOLD,
    paddingHorizontal: 18, paddingVertical: 6,
    marginBottom: 12,
  },
  recordTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: GOLD },

  // Tebrikler
  congrats: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 32, color: TEXT,
    marginTop: 8, marginBottom: 6,
  },
  sub: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16, color: MUTED,
    marginBottom: 24,
  },

  // Puan
  puaninLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 15, color: MUTED,
    marginBottom: 4,
  },
  scoreNum: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 72, color: TEXT,
    lineHeight: 80, marginBottom: 8,
  },

  // Coin
  coinRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: 40,
  },
  coinPlus: { fontFamily: 'Nunito-Bold', fontSize: 18, color: GOLD },

  // Butonlar
  btns: { width: '100%', gap: 12 },
  primaryBtn: {
    alignSelf: 'stretch',
    backgroundColor: PURP,
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
    shadowColor: PURP2, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  primaryBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT },
  secondaryBtn: {
    backgroundColor: CARD,
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#2e2b5a',
  },
  secondaryBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT },
  shareBtn: { alignItems: 'center', paddingVertical: 8 },
  shareTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: MUTED },

  ligCard:    { width: '100%', backgroundColor: '#13132a', borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: '#2e2b5a' },
  ligRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ligLabel:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  ligVal:     { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#ffffff' },
  ligDivider: { height: 1, backgroundColor: '#2e2b5a' },
});

// ── Başarısız lig ekranı stilleri — Pembe mockup teması ──────────────
const fs = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fdf2f8' },

  floatHeart: { position: 'absolute', zIndex: 0 },

  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12, zIndex: 1 },

  emoji: { fontSize: 80, marginBottom: 6 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: '#ef4444', textAlign: 'center' },
  sub:   { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#9ca3af', textAlign: 'center', lineHeight: 22, marginBottom: 4 },

  cards: { width: '100%', gap: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', borderRadius: 20,
    padding: 16, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },

  cardIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#111827', marginBottom: 2 },
  cardSub:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af' },

  badge:    { backgroundColor: '#6c3aed', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 },
  badgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: '#fff' },

  coinBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: '#fde68a' },
  coinBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#d97706' },
  cardHighlight:{ borderWidth: 2, borderColor: '#fde68a' },

  homeBtn: {
    width: '100%', backgroundColor: '#6c3aed', borderRadius: 20,
    paddingVertical: 18, alignItems: 'center', marginTop: 4,
    shadowColor: '#6c3aed', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  homeBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#fff' },
});
