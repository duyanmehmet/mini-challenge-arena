import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGameStore } from '../../src/store/gameStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { GAME_MODES, type GameModeId } from '../../src/constants/gameModes';
import { ReflexMode } from '../../src/components/game/modes/ReflexMode';
import { MemoryMode } from '../../src/components/game/modes/MemoryMode';
import { FootballMode } from '../../src/components/game/modes/FootballMode';
import { WordMode } from '../../src/components/game/modes/WordMode';
import { EscapeMode } from '../../src/components/game/modes/EscapeMode';
import { MathMode } from '../../src/components/game/modes/MathMode';
import { EnglishMode } from '../../src/components/game/modes/EnglishMode';

const REVIVE_COST = 50;

export default function GameScreen() {
  const { mode } = useLocalSearchParams<{ mode: GameModeId }>();
  const { startGame, endGame, pauseGame, resumeGame, buyLife, lives } = useGameStore();
  const { user } = useUserStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [paused, setPaused] = useState(false);
  const [showRevive, setShowRevive] = useState(false);
  const started = useRef(false);

  const modeCfg = GAME_MODES.find((m) => m.id === mode);

  useEffect(() => {
    if (!started.current && mode) {
      started.current = true;
      startGame(mode as GameModeId);
    }
  }, [mode]);

  const handleEnd = () => {
    if (lives <= 0 && user && user.coins >= REVIVE_COST && !showRevive) {
      pauseGame();
      setShowRevive(true);
      return;
    }

    const result = endGame();
    router.replace({
      pathname: '/game/result',
      params: { mode: mode ?? '', score: String(result.score), maxCombo: String(result.maxCombo), duration: String(result.durationSeconds) },
    });
  };

  const handleRevive = () => {
    const success = buyLife(REVIVE_COST);
    if (success) {
      setShowRevive(false);
      resumeGame();
    } else {
      Alert.alert('Hata', 'Yetersiz coin!');
      handleEnd();
    }
  };

  const handlePause = () => { setPaused(true); pauseGame(); };
  const handleResume = () => { setPaused(false); resumeGame(); };
  const handleQuit = () => {
    setPaused(false);
    setShowRevive(false);
    endGame();
    router.replace('/(tabs)');
  };

  const s = styles(C);

  const renderMode = () => {
    if (paused || showRevive) return null;
    switch (mode as GameModeId) {
      case 'reflex':   return <ReflexMode onEnd={handleEnd} />;
      case 'memory':   return <MemoryMode onEnd={handleEnd} />;
      case 'football': return <FootballMode onEnd={handleEnd} />;
      case 'word':     return <WordMode onEnd={handleEnd} />;
      case 'escape':   return <EscapeMode onEnd={handleEnd} />;
      case 'math':     return <MathMode onEnd={handleEnd} />;
      case 'english':  return <EnglishMode onEnd={handleEnd} />;
      default: return <Text style={{ color: C.textPrimary }}>Bilinmeyen mod</Text>;
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bgPrimary }]}>
      <View style={s.topBar}>
        <Text style={[s.modeName, { color: C.textPrimary }]}>{modeCfg?.icon} {modeCfg?.name}</Text>
        <TouchableOpacity style={[s.pauseBtn, { backgroundColor: C.bgSecondary }]} onPress={handlePause}>
          <Text style={{ fontSize: 18 }}>⏸</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>{renderMode()}</View>

      {/* Duraklatma Modalı */}
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

      {/* Canlanma Modalı */}
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
  modeName: { fontSize: 16, fontFamily: 'Nunito-Bold' },
  pauseBtn: { padding: 8, borderRadius: 20 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  pauseCard: { width: 300, borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  pauseTitle: { fontSize: 24, fontFamily: 'Nunito-ExtraBold', marginBottom: 4 },
  pauseBtn2: { width: '100%', borderRadius: 14, padding: 16, alignItems: 'center' },
  pauseBtnText: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#fff' },
});
