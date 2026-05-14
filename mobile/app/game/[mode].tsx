import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useGameStore } from '../../src/store/gameStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { CATEGORIES, type CategoryId } from '../../src/constants/categories';
import { QuizMode } from '../../src/components/game/modes/QuizMode';

const REVIVE_COST = 50;

const QUIZ_CATEGORIES: CategoryId[] = [
  'history','geography','science','general','art','cinema','sports','turkey',
  'kids','license','medical','economy',
];

export default function GameScreen() {
  const { mode, challengeId } = useLocalSearchParams<{ mode: string; challengeId?: string }>();
  const { startGame, endGame, pauseGame, resumeGame, buyLife } = useGameStore();
  const { user } = useUserStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [paused, setPaused] = useState(false);
  const [showRevive, setShowRevive] = useState(false);
  const started = useRef(false);

  const catCfg = CATEGORIES.find((c) => c.id === mode);

  useEffect(() => {
    if (!started.current && mode) {
      started.current = true;
      startGame(mode as any);
    }
  }, [mode]);

  const handleEnd = () => {
    const result = endGame();
    router.replace({
      pathname: '/game/result',
      params: {
        mode: mode ?? '',
        score: String(result.score),
        maxCombo: String(result.maxCombo),
        duration: String(result.durationSeconds),
        ...(challengeId ? { challengeId } : {}),
      },
    });
  };

  const handleRevive = () => {
    const success = buyLife(REVIVE_COST);
    if (success) { setShowRevive(false); resumeGame(); }
    else { Alert.alert('Hata', 'Yetersiz coin!'); handleEnd(); }
  };

  const handlePause = () => { setPaused(true); pauseGame(); };
  const handleResume = () => { setPaused(false); resumeGame(); };
  const handleQuit = () => { setPaused(false); setShowRevive(false); endGame(); router.replace('/(tabs)'); };

  const s = styles(C);

  const isQuizMode = QUIZ_CATEGORIES.includes(mode as CategoryId);

  const renderContent = () => {
    if (paused || showRevive) return null;
    if (isQuizMode) return (
      <QuizMode
        categoryId={mode as CategoryId}
        onEnd={handleEnd}
      />
    );
    return <Text style={{ color: C.textPrimary, textAlign: 'center', marginTop: 40 }}>Bilinmeyen kategori</Text>;
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bgPrimary }]}>
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <Text style={s.catIcon}>{catCfg?.icon}</Text>
          <Text style={[s.modeName, { color: C.textPrimary }]}>{catCfg?.name}</Text>
        </View>
        <TouchableOpacity style={[s.pauseBtn, { backgroundColor: C.bgSecondary }]} onPress={handlePause}>
          <Text style={{ fontSize: 18 }}>⏸</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>{renderContent()}</View>

      <Modal visible={paused} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.pauseCard, { backgroundColor: C.bgSecondary }]}>
            <Text style={[s.pauseTitle, { color: C.textPrimary }]}>⏸ Duraklatıldı</Text>
            <TouchableOpacity style={[s.pauseBtn2, { backgroundColor: C.accentTeal }]} onPress={handleResume}>
              <Text style={s.pauseBtnText}>▶ Devam Et</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.pauseBtn2, { backgroundColor: C.danger + '33' }]} onPress={handleQuit}>
              <Text style={[s.pauseBtnText, { color: C.danger }]}>🏠 Ana Menüye Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRevive} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={[s.pauseCard, { backgroundColor: C.bgSecondary, borderColor: C.accentYellow, borderWidth: 2 }]}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>💔</Text>
            <Text style={[s.pauseTitle, { color: C.textPrimary }]}>Canın Bitti!</Text>
            <Text style={{ color: C.textSecondary, textAlign: 'center', marginBottom: 10 }}>
              {REVIVE_COST} Coin harcayarak +1 can ile devam etmek ister misin?
            </Text>
            <TouchableOpacity style={[s.pauseBtn2, { backgroundColor: C.accentYellow }]} onPress={handleRevive}>
              <Text style={[s.pauseBtnText, { color: '#000' }]}>✨ Canlan ({REVIVE_COST} Coin)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.pauseBtn2, { backgroundColor: C.bgTertiary }]} onPress={() => { setShowRevive(false); handleEnd(); }}>
              <Text style={[s.pauseBtnText, { color: C.textSecondary }]}>Hayır, Bitir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIcon: { fontSize: 20 },
  modeName: { fontSize: 15, fontFamily: 'Nunito-Bold' },
  pauseBtn: { padding: 8, borderRadius: 20 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  pauseCard: { width: 300, borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  pauseTitle: { fontSize: 22, fontFamily: 'Nunito-ExtraBold', marginBottom: 4 },
  pauseBtn2: { width: '100%', borderRadius: 14, padding: 16, alignItems: 'center' },
  pauseBtnText: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#fff' },
});
