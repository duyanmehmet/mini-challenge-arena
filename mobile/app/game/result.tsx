import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { GAME_MODES } from '../../src/constants/gameModes';
import { gameService } from '../../src/services/game.service';
import LottieView from 'lottie-react-native';
import { assetService } from '../../src/services/asset.service';
import { admobService } from '../../src/services/admob.service';
import { Share } from 'react-native';




export default function ResultScreen() {
  const { mode, score, maxCombo, duration } = useLocalSearchParams<{
    mode: string; score: string; maxCombo: string; duration: string;
  }>();
  const { theme } = useSettingsStore();
  const { personalBests, setPersonalBests, addXP, addCoins, updateUser } = useUserStore();
  const C = Colors[theme];

  const numScore = parseInt(score ?? '0');
  const numCombo = parseInt(maxCombo ?? '0');
  const numDuration = parseInt(duration ?? '0');
  const modeCfg = GAME_MODES.find((m) => m.id === mode);

  const prevBest = personalBests.find((p) => p.mode === mode);
  const isNewRecord = !prevBest || numScore > prevBest.score;

  const xpEarned = 10 + (isNewRecord ? 25 : 0);
  const coinsEarned = Math.floor(numScore / 100) + 5;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    addXP(xpEarned);
    addCoins(coinsEarned);
    admobService.showInterstitial(); // Reklamı tetikle


    if (isNewRecord) {
      assetService.playSound('levelup');
      const updated = personalBests.filter((p) => p.mode !== mode);
      setPersonalBests([...updated, { mode: mode ?? '', score: numScore, achievedAt: new Date().toISOString() }]);
    }


    // Backend'e skor gönder, dönüşte streak/level store'a yansıt
    gameService.submitResult({
      mode: mode ?? '',
      score: numScore,
      duration_seconds: numDuration,
      combo_max: numCombo,
    }).then((res) => {
      if (res?.streakCount !== undefined) updateUser({ streakCount: res.streakCount });
      if (res?.newLevel)                  updateUser({ level: res.newLevel });
      if (res?.badgesUnlocked?.length)    assetService.playSound('win');
    }).catch(() => {});
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mini Challenge Arena'da ${modeCfg?.name} modunda ${numScore} puan yaptım! Hadi sen de gel yarışalım! ⚡`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.container, { opacity: fadeAnim }]}>

        {isNewRecord && (
          <View style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]} pointerEvents="none">
            <LottieView
              source={assetService.getAnimation('confetti')}
              autoPlay
              loop={false}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        )}

        {isNewRecord && (
          <Animated.Text style={[s.record, { transform: [{ scale: scaleAnim }] }]}>
            🎉 YENİ REKOR!
          </Animated.Text>
        )}


        <Text style={s.modeIcon}>{modeCfg?.icon ?? '🎮'}</Text>
        <Text style={s.modeName}>{modeCfg?.name}</Text>

        <Animated.Text style={[s.scoreText, { transform: [{ scale: scaleAnim }], color: C.accentYellow }]}>
          {numScore.toLocaleString('tr-TR')}
        </Animated.Text>
        <Text style={s.scoreLabel}>puan</Text>

        <View style={s.statsRow}>
          <StatBox label="En Yüksek Combo" value={`x${numCombo}`} color={C.accentTeal} />
          <StatBox label="Süre" value={`${numDuration}s`} color={C.accentPurple} />
          <StatBox label="XP" value={`+${xpEarned}`} color={C.accentGreen} />
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
      <Text style={{ color: '#8888aa', fontSize: 11, fontFamily: 'Nunito-Regular', textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  record: { fontSize: 22, color: C.accentYellow, fontFamily: 'Nunito-ExtraBold', marginBottom: 8 },
  modeIcon: { fontSize: 64, marginBottom: 4 },
  modeName: { color: C.textSecondary, fontFamily: 'Nunito-Regular', fontSize: 15, marginBottom: 16 },
  scoreText: { fontSize: 72, fontFamily: 'Nunito-ExtraBold', lineHeight: 80 },
  scoreLabel: { color: C.textSecondary, fontFamily: 'Nunito-Regular', fontSize: 16, marginBottom: 24 },
  statsRow: { flexDirection: 'row', width: '100%', backgroundColor: C.bgSecondary, borderRadius: 16, padding: 16, marginBottom: 16 },
  rewardsRow: { flexDirection: 'row', gap: 24, marginBottom: 32 },
  reward: { fontFamily: 'Nunito-Bold', fontSize: 16 },
  buttons: { width: '100%', gap: 12 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 16 },
});
