import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  const { mode, score, maxCombo, duration, challengeId, ligMode, ligFailed } = useLocalSearchParams<{
    mode: string; score: string; maxCombo: string; duration: string;
    challengeId?: string; ligMode?: string; ligFailed?: string;
  }>();
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
  const [displayScore, setDisplayScore] = useState(0);
  const [ligResult,    setLigResult]    = useState<any>(null);

  useEffect(() => {
    const lid = counterAnim.addListener(({ value }) => setDisplayScore(Math.round(value)));

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(counterAnim, { toValue: numScore, duration: 1500, useNativeDriver: false }),
    ]).start();

    if (!isLigFailed) {
      addXP(xpEarned);
      addCoins(coinsEarned);
    }
    if (mode) incrementCategoryPlayCount(mode);

    if (!isLigFailed && isNewRecord) {
      assetService.playSound('levelup');
      const updated = personalBests.filter(p => p.mode !== mode);
      setPersonalBests([...updated, { mode: mode ?? '', score: numScore, achievedAt: new Date().toISOString() }]);
    }

    if (challengeId) {
      api.post('/challenge/submit', { challengeId, score: numScore }).catch(() => {});
    }
    // Lig: sadece başarılıysa gönder
    if (isLig && !isLigFailed) {
      api.post('/lig/submit', { score: numScore, categoryId: mode })
        .then(r => setLigResult(r.data))
        .catch(() => {});
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
        message: `${cat} kategorisinde ${numScore.toLocaleString('tr-TR')} puan yaptım!${rec}\n\nZeka Meydanı'nda beni geçebilir misin? ⚡`,
      });
    } catch {}
  };

  // ── Lig Başarısız Ekranı ──────────────────────────────────────────
  if (isLig && isLigFailed) {
    const handleWatchAd = async () => {
      await admobService.showRewarded(async () => {
        await api.post('/lig/revive').catch(() => {});
      });
      router.replace('/lig' as any);
    };

    return (
      <SafeAreaView style={[s.root, fs.root]}>
        <Animated.View style={[fs.wrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Başlık */}
          <Text style={fs.emoji}>💔</Text>
          <Text style={fs.title}>Kalpler Bitti!</Text>
          <Text style={fs.sub}>Skor kaydedilmedi. Kalp kazanarak tekrar dene.</Text>

          {/* Seçenekler */}
          <View style={fs.cards}>

            {/* Reklam */}
            <TouchableOpacity style={[fs.card, fs.cardGreen]} onPress={handleWatchAd} activeOpacity={0.85}>
              <View style={fs.cardLeft}>
                <Text style={fs.cardIcon}>📺</Text>
                <View>
                  <Text style={fs.cardTitle}>Reklam İzle</Text>
                  <Text style={fs.cardSub}>Ücretsiz · 30 saniye</Text>
                </View>
              </View>
              <View style={fs.cardBadge}>
                <Text style={fs.cardBadgeTxt}>+1 ❤️</Text>
              </View>
            </TouchableOpacity>

            {/* Mağaza */}
            <TouchableOpacity style={[fs.card, fs.cardGold]} onPress={() => router.replace('/shop' as any)} activeOpacity={0.85}>
              <View style={fs.cardLeft}>
                <Text style={fs.cardIcon}>🏪</Text>
                <View>
                  <Text style={fs.cardTitle}>Mağaza</Text>
                  <Text style={fs.cardSub}>Coin veya reklam ile doldur</Text>
                </View>
              </View>
              <Text style={fs.cardArrow}>›</Text>
            </TouchableOpacity>

            {/* Bekle */}
            <TouchableOpacity style={fs.card} onPress={() => router.replace('/lig' as any)} activeOpacity={0.85}>
              <View style={fs.cardLeft}>
                <Text style={fs.cardIcon}>⏳</Text>
                <View>
                  <Text style={[fs.cardTitle, { color: MUTED }]}>Bekle</Text>
                  <Text style={fs.cardSub}>2 saatte 1 kalp yenilenir</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>

          {/* Ana sayfa */}
          <TouchableOpacity style={fs.card} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
            <View style={fs.cardLeft}>
              <Text style={fs.cardIcon}>🏠</Text>
              <View>
                <Text style={[fs.cardTitle, { color: MUTED }]}>Ana Sayfaya Dön</Text>
                <Text style={fs.cardSub}>Oyuna ara ver</Text>
              </View>
            </View>
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

        {/* Butonlar */}
        <View style={s.btns}>
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnTxt}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => router.replace(`/game/${mode}` as any)}
            activeOpacity={0.85}
          >
            <Text style={s.secondaryBtnTxt}>Tekrar Oyna</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={s.shareBtn}>
            <Text style={s.shareTxt}>📤 Paylaş</Text>
          </TouchableOpacity>
        </View>

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

// ── Başarısız lig ekranı stilleri ────────────────────────────────────
const fs = StyleSheet.create({
  root: { backgroundColor: '#0d0d1a' },
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 10 },

  emoji: { fontSize: 72, marginBottom: 4 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: '#ef4444', textAlign: 'center' },
  sub:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#7c7aaa', textAlign: 'center', lineHeight: 21, marginBottom: 8 },

  cards: { width: '100%', gap: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#13132a', borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: '#2e2b5a',
  },
  cardGreen: { borderColor: '#22c55e55', backgroundColor: '#22c55e0d' },
  cardGold:  { borderColor: '#f59e0b55', backgroundColor: '#f59e0b0d' },

  cardLeft:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIcon:  { fontSize: 30 },
  cardTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#ffffff' },
  cardSub:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#7c7aaa', marginTop: 2 },

  cardBadge:    { backgroundColor: '#22c55e22', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#22c55e55' },
  cardBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#22c55e' },

  cardArrow: { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: '#f59e0b' },

});
