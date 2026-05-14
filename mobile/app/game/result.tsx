import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated }
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { CATEGORIES } from '../../src/constants/categories';
import { gameService } from '../../src/services/game.service';
import { assetService } from '../../src/services/asset.service';
import api from '../../src/services/api';
import { Share }
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen() {
  const { mode, score, maxCombo, duration, challengeId } = useLocalSearchParams<{
    mode: string; score: string; maxCombo: string; duration: string; challengeId?: string;
  }>();
  const { theme } = useSettingsStore();
  const { personalBests, setPersonalBests, addXP, addCoins, updateUser } = useUserStore();
  const C = Colors[theme];

  const numScore    = parseInt(score    ?? '0');
  const numCombo    = parseInt(maxCombo ?? '0');
  const numDuration = parseInt(duration ?? '0');
  const modeCfg     = CATEGORIES.find((m) => m.id === mode);

  const prevBest    = personalBests.find((p) => p.mode === mode);
  const isNewRecord = !prevBest || numScore > prevBest.score;

  const xpEarned    = 10 + (isNewRecord ? 25 : 0);
  const coinsEarned = Math.floor(numScore / 100) + 5;

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const counterAnim = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Puan sayacı
    const listenerId = counterAnim.addListener(({ value }) => setDisplayScore(Math.round(value)));

    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(counterAnim, { toValue: numScore, duration: 1200, useNativeDriver: false }),
    ]).start();

    // XP & coin ekle
    addXP(xpEarned);
    addCoins(coinsEarned);

    // Kişisel rekor güncelle
    if (isNewRecord) {
      assetService.playSound('levelup');
      const updated = personalBests.filter((p) => p.mode !== mode);
      setPersonalBests([...updated, { mode: mode ?? '', score: numScore, achievedAt: new Date().toISOString() }]);
    }

    // Challenge skoru varsa kaydet
    if (challengeId) {
      api.post('/challenge/submit', { challengeId, score: numScore }).catch(() => {});
    }

    // Backend'e skor gönder — başarısız olursa 2 kez daha dene
    const submitWithRetry = async (retries = 3): Promise<void> => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await gameService.submitResult({
            mode: mode ?? '',
            score: numScore,
            duration_seconds: numDuration,
            combo_max: numCombo,
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
    submitWithRetry();

    return () => counterAnim.removeListener(listenerId);
  }, []);

  const handleShare = async () => {
    const cat    = modeCfg?.name ?? 'Quiz';
    const record = isNewRecord ? ' 🏆 Yeni rekor!' : '';
    try {
      await Share.share({
        message: `${cat} kategorisinde ${numScore.toLocaleString('tr-TR')} puan yaptım!${record}\n\nBil Bakalım'da beni geçebilir misin? ⚡\n#BilBakalim #Quiz`,
      });
    } catch {}
  };

  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>

        {isNewRecord && (
          <Animated.Text style={[s.record, { transform: [{ scale: scaleAnim }], color: C.accentYellow }]}>
            🏆 YENİ REKOR!
          </Animated.Text>
        )}

        <Text style={s.modeIcon}>{modeCfg?.icon ?? '🎯'}</Text>
        <Text style={[s.modeName, { color: C.textSecondary }]}>{modeCfg?.name}</Text>

        <Animated.Text style={[s.scoreText, { transform: [{ scale: scaleAnim }], color: C.accentYellow }]}>
          {displayScore.toLocaleString('tr-TR')}
        </Animated.Text>
        <Text style={[s.scoreLabel, { color: C.textSecondary }]}>puan</Text>

        <View style={[s.statsRow, { backgroundColor: C.bgSecondary }]}>
          <StatBox label="En Yüksek Combo" value={`x${numCombo}`}    color={C.accentTeal}   />
          <StatBox label="Süre"             value={`${numDuration}s`} color={C.accentPurple} />
          <StatBox label="XP"               value={`+${xpEarned}`}    color={C.accentGreen}  />
        </View>

        <View style={s.rewardsRow}>
          <Text style={[s.reward, { color: C.accentYellow }]}>🪙 +{coinsEarned} coin</Text>
          <Text style={[s.reward, { color: C.accentTeal }]}>⚡ +{xpEarned} XP</Text>
        </View>

        <View style={s.buttons}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: C.accentRed, flex: 1 }]}
              onPress={() => router.replace(`/game/${mode}`)}
            >
              <Text style={s.btnText}>🔄 Tekrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: C.accentTeal, flex: 1 }]}
              onPress={handleShare}
            >
              <Text style={s.btnText}>📤 Paylaş</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.btn, { backgroundColor: C.bgTertiary }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[s.btnText, { color: C.textSecondary }]}>🏠 Ana Menü</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color, fontSize: 20, fontFamily: 'Nunito-ExtraBold' }}>{value}</Text>
      <Text style={{ color: '#888', fontSize: 11, fontFamily: 'Nunito-Regular', textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bgPrimary },
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  record:      { fontSize: 22, fontFamily: 'Nunito-ExtraBold', marginBottom: 8 },
  modeIcon:    { fontSize: 64, marginBottom: 4 },
  modeName:    { fontFamily: 'Nunito-Regular', fontSize: 15, marginBottom: 16 },
  scoreText:   { fontSize: 72, fontFamily: 'Nunito-ExtraBold', lineHeight: 80 },
  scoreLabel:  { fontFamily: 'Nunito-Regular', fontSize: 16, marginBottom: 24 },
  statsRow:    { flexDirection: 'row', width: '100%', borderRadius: 16, padding: 16, marginBottom: 16 },
  rewardsRow:  { flexDirection: 'row', gap: 24, marginBottom: 32 },
  reward:      { fontFamily: 'Nunito-Bold', fontSize: 16 },
  buttons:     { width: '100%', gap: 12 },
  btn:         { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnText:     { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 16 },
});
