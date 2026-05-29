import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useGameStore } from '../../src/store/gameStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { CATEGORIES, type CategoryId } from '../../src/constants/categories';
import { QuizMode } from '../../src/components/game/modes/QuizMode';
import api from '../../src/services/api';

const QUIZ_CATEGORIES: CategoryId[] = [
  'history','geography','science','general','art','cinema','sports','turkey',
  'kids','license','medical','economy','fun',
  'arabic','french','german','spanish','english',
];

export default function GameScreen() {
  const { mode, challengeId, ligMode, antrenmanMode } = useLocalSearchParams<{
    mode: string; challengeId?: string; ligMode?: string; antrenmanMode?: string;
  }>();
  const isAntrenman = antrenmanMode === '1';
  const { startGame, endGame, pauseGame, resumeGame } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [paused,       setPaused]       = useState(false);
  const [ligHearts,    setLigHearts]    = useState<number | null>(null);
  const [heartBlocked, setHeartBlocked] = useState(false);
  const started       = useRef(false);
  const failedRef     = useRef(false);
  const wrongCount    = useRef(0); // yanlış cevap sayacı
  const isLigMode     = ligMode === '1';

  const catCfg     = CATEGORIES.find(c => c.id === mode);
  const isQuizMode = QUIZ_CATEGORIES.includes(mode as CategoryId);

  // Lig modunda oyun başlamadan server'dan kalp say
  useEffect(() => {
    if (!isLigMode) {
      setLigHearts(null);
      return;
    }
    api.get('/lig/current')
      .then(r => {
        const h = r.data?.hearts ?? 5;
        if (h <= 0) {
          setHeartBlocked(true);
        } else {
          setLigHearts(h);
        }
      })
      .catch(() => setLigHearts(5)); // API yoksa 5 ver
  }, [isLigMode]);

  // Oyunu başlat
  useEffect(() => {
    if (started.current) return;
    if (isLigMode && ligHearts === null) return; // kalpler yüklensin bekle
    if (heartBlocked) return;
    started.current = true;
    if (mode) startGame(mode as any);
  }, [ligHearts, heartBlocked, isLigMode]);

  // Oyun bitti → kalpleri toplu düşür → result'a git
  const goToResult = (failed: boolean) => {
    const result = endGame();

    // Lig modunda yanlış sayısını sunucuya tek seferde gönder
    if (isLigMode && wrongCount.current > 0) {
      api.post('/lig/lose-hearts', { count: wrongCount.current }).catch(() => {});
    }

    router.replace({
      pathname: '/game/result',
      params: {
        mode:     mode ?? '',
        score:    String(result.score),
        maxCombo: String(result.maxCombo),
        duration: String(result.durationSeconds),
        ...(challengeId ? { challengeId } : {}),
        ...(isLigMode ? {
          ligMode:   '1',
          ligFailed: failed ? '1' : '0',
          ligWrong:  String(wrongCount.current),
        } : {}),
        ...(isAntrenman ? { antrenmanMode: '1' } : {}),
      },
    });
  };

  const handleEnd = () => goToResult(failedRef.current);

  // Yanlış cevap → her seferinde 1 can düş
  const handleLifeLost = () => {
    wrongCount.current += 1;
    setLigHearts(prev => {
      const next = Math.max(0, (prev ?? 5) - 1);
      if (next <= 0) failedRef.current = true;
      return next;
    });
  };

  const handlePause  = () => { setPaused(true);  pauseGame(); };
  const handleResume = () => { setPaused(false); resumeGame(); };
  const handleQuit   = () => { endGame(); router.replace('/(tabs)'); };

  const s = styles(C);

  // Kalp kontrolü yükleniyor
  if (isLigMode && ligHearts === null && !heartBlocked) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: '#0d0d1a', alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#8b5cf6" size="large" />
      </SafeAreaView>
    );
  }

  // Kalp 0 — oyna butonu engelli
  if (heartBlocked) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: '#ffffff' }]}>
        <View style={s.blockedWrap}>
          <Text style={{ fontSize: 64 }}>🖤🖤🖤🖤🖤</Text>
          <Text style={s.blockedTitle}>Kalplerin Bitti!</Text>
          <Text style={s.blockedSub}>Lig oynamak için kalp gerekiyor.{'\n'}Bekle, reklam izle veya mağazadan al.</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => { endGame(); router.replace('/shop' as any); }}>
            <Text style={s.shopBtnTxt}>🏪 Mağazaya Git</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backBtnTxt}>← Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: '#ffffff' }]}>
      <View style={{ flex: 1 }}>
        {!paused && isQuizMode && (
          <QuizMode
            categoryId={mode as CategoryId}
            onEnd={handleEnd}
            onPause={handlePause}
            catIcon={catCfg?.icon}
            lives={isLigMode ? (ligHearts ?? 5) : isAntrenman ? 999 : undefined}
            questionCount={isAntrenman ? 15 : undefined}
            onLifeLost={isLigMode ? handleLifeLost : undefined}
          />
        )}
        {!paused && !isQuizMode && (
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
            Bilinmeyen kategori
          </Text>
        )}
      </View>

      <Modal visible={paused} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.card, { backgroundColor: C.bgSecondary }]}>
            <Text style={[s.cardTitle, { color: C.textPrimary }]}>⏸ Duraklatıldı</Text>
            {isLigMode && ligHearts !== null && (
              <View style={s.heartsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={i} style={{ fontSize: 20, opacity: i < ligHearts ? 1 : 0.2 }}>❤️</Text>
                ))}
              </View>
            )}
            <TouchableOpacity style={[s.btn, { backgroundColor: C.accentTeal }]} onPress={handleResume}>
              <Text style={s.btnTxt}>▶ Devam Et</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, { backgroundColor: C.danger + '33' }]} onPress={handleQuit}>
              <Text style={[s.btnTxt, { color: C.danger }]}>🏠 Çık</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe:  { flex: 1 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  card:    { width: 300, borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 22, fontFamily: 'Nunito-ExtraBold', marginBottom: 4 },
  heartsRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  btn:     { width: '100%', borderRadius: 14, padding: 16, alignItems: 'center' },
  btnTxt:  { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#fff' },

  blockedWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  blockedTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 26, color: '#fff' },
  blockedSub:   { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#7c7aaa', textAlign: 'center', lineHeight: 22 },
  shopBtn:  { backgroundColor: '#6c3aed', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  shopBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#fff' },
  backBtn:  { paddingVertical: 10 },
  backBtnTxt: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#7c7aaa' },
});
