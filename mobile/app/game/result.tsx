import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { CATEGORIES } from '../../src/constants/categories';
import { gameService } from '../../src/services/game.service';
import { assetService } from '../../src/services/asset.service';
import api from '../../src/services/api';
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
  const { mode, score, maxCombo, duration, challengeId } = useLocalSearchParams<{
    mode: string; score: string; maxCombo: string; duration: string; challengeId?: string;
  }>();
  const { personalBests, setPersonalBests, addXP, addCoins, updateUser, incrementCategoryPlayCount } = useUserStore();

  const numScore    = parseInt(score    ?? '0');
  const numCombo    = parseInt(maxCombo ?? '0');
  const numDuration = parseInt(duration ?? '0');
  const modeCfg     = CATEGORIES.find(m => m.id === mode);
  const prevBest    = personalBests.find(p => p.mode === mode);
  const isNewRecord = !prevBest || numScore > prevBest.score;
  const xpEarned    = 10 + (isNewRecord ? 25 : 0);
  const coinsEarned = Math.floor(numScore / 100) + 5;

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const lid = counterAnim.addListener(({ value }) => setDisplayScore(Math.round(value)));

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(counterAnim, { toValue: numScore, duration: 1500, useNativeDriver: false }),
    ]).start();

    addXP(xpEarned);
    addCoins(coinsEarned);
    if (mode) incrementCategoryPlayCount(mode);

    if (isNewRecord) {
      assetService.playSound('levelup');
      const updated = personalBests.filter(p => p.mode !== mode);
      setPersonalBests([...updated, { mode: mode ?? '', score: numScore, achievedAt: new Date().toISOString() }]);
    }

    if (challengeId) {
      api.post('/challenge/submit', { challengeId, score: numScore }).catch(() => {});
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
    submit();

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

  return (
    <SafeAreaView style={s.root}>
      <Animated.View style={[s.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Yeni Rekor badge */}
        {isNewRecord && (
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
});
