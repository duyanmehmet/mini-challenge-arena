import { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Vibration } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';

const BUTTONS = [
  { id: 0, color: '#e94560', dark: '#8b1a2e', emoji: '🔴', label: 'Kırmızı' },
  { id: 1, color: '#2ecc71', dark: '#166a3a', emoji: '🟢', label: 'Yeşil'  },
  { id: 2, color: '#f0c040', dark: '#7a6010', emoji: '🟡', label: 'Sarı'   },
  { id: 3, color: '#4ecdc4', dark: '#1e6b66', emoji: '🔵', label: 'Mavi'   },
];

type Phase = 'show' | 'input' | 'result' | 'countdown';

interface Props { onEnd: () => void }

export function MemoryMode({ onEnd }: Props) {
  const { addScore, score } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [sequence, setSequence]   = useState<number[]>([]);
  const [inputSeq, setInputSeq]   = useState<number[]>([]);
  const [phase, setPhase]         = useState<Phase>('show');
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [round, setRound]         = useState(1);
  const [lives, setLives]         = useState(3);
  const [countdown, setCountdown] = useState(3);
  const [wrongBtn, setWrongBtn]   = useState<number | null>(null);

  const endCalled = useRef(false);
  const showSpeed = useRef(600);

  // İlk sekansı oluştur
  useEffect(() => {
    startNewRound([]);
  }, []);

  const startNewRound = useCallback((prev: number[]) => {
    const next = [...prev, Math.floor(Math.random() * 4)];
    setSequence(next);
    setInputSeq([]);
    setRound(next.length);
    showSpeed.current = Math.max(280, 600 - next.length * 25);
    setPhase('show');
  }, []);

  // Gösterim animasyonu
  useEffect(() => {
    if (phase !== 'show') return;
    let i = 0;
    const show = () => {
      if (i >= sequence.length) {
        setTimeout(() => setPhase('input'), 400);
        return;
      }
      setActiveBtn(sequence[i]);
      assetService.playSound('hit');
      setTimeout(() => {
        setActiveBtn(null);
        i++;
        setTimeout(show, showSpeed.current * 0.3);
      }, showSpeed.current * 0.7);
    };
    const t = setTimeout(show, 600);
    return () => clearTimeout(t);
  }, [phase, sequence]);

  const handlePress = useCallback((btnId: number) => {
    if (phase !== 'input') return;
    setActiveBtn(btnId);
    setTimeout(() => setActiveBtn(null), 200);

    const next = [...inputSeq, btnId];
    const idx  = next.length - 1;

    if (next[idx] !== sequence[idx]) {
      // Yanlış!
      assetService.playSound('miss');
      assetService.vibrate([0, 200, 100, 200]);
      setWrongBtn(btnId);
      setTimeout(() => setWrongBtn(null), 600);

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setPhase('result');
        setTimeout(() => { if (!endCalled.current) { endCalled.current = true; onEnd(); } }, 1500);
      } else {
        // Tekrar göster
        setTimeout(() => {
          setInputSeq([]);
          setPhase('show');
        }, 1000);
      }
      return;
    }

    if (next.length === sequence.length) {
      // Doğru!
      const pts = sequence.length * 50 + (sequence.length > 6 ? 100 : 0);
      addScore(pts);
      assetService.playSound('combo');
      assetService.vibrate([0, 40, 20, 60]);
      setPhase('countdown');
      let c = 3;
      setCountdown(c);
      const tick = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(tick);
          startNewRound(sequence);
        }
      }, 700);
    } else {
      setInputSeq(next);
    }
  }, [phase, inputSeq, sequence, lives, addScore, onEnd, startNewRound]);

  const s = styles(C);

  const phaseMsg = {
    show: '👀 İzle ve ezberle!',
    input: '👆 Sırayı tekrarla!',
    result: '❌ Oyun Bitti!',
    countdown: '✅ Harika!',
  }[phase];

  return (
    <View style={s.root}>
      <ScoreBar />

      {/* Tur + Canlar */}
      <View style={s.header}>
        <View style={s.roundBadge}>
          <Text style={s.roundLabel}>TUR</Text>
          <Text style={[s.roundNum, { color: C.accentTeal }]}>{round}</Text>
        </View>

        <View style={s.center}>
          <Text style={[s.phaseMsg, { color: phase === 'input' ? C.accentYellow : C.textSecondary }]}>{phaseMsg}</Text>
          {phase === 'input' && (
            <Text style={[s.progress, { color: C.textSecondary }]}>{inputSeq.length} / {sequence.length}</Text>
          )}
          {phase === 'countdown' && (
            <Text style={[s.countNum, { color: C.accentTeal }]}>{countdown}</Text>
          )}
        </View>

        <View style={s.lives}>
          {[0,1,2].map((i) => (
            <Text key={i} style={[s.heart, { opacity: i < lives ? 1 : 0.2 }]}>❤️</Text>
          ))}
        </View>
      </View>

      {/* Sekans göstergesi */}
      <View style={s.seqRow}>
        {sequence.map((btnId, i) => {
          const done  = i < inputSeq.length;
          const btn   = BUTTONS[btnId];
          return (
            <View key={i} style={[s.seqDot, {
              backgroundColor: done ? btn.color : C.bgTertiary,
              width: Math.min(28, (280 / sequence.length) - 4),
            }]} />
          );
        })}
      </View>

      {/* 4 Renkli Buton — 2x2 grid */}
      <View style={s.grid}>
        {BUTTONS.map((btn) => {
          const isActive = activeBtn === btn.id;
          const isWrong  = wrongBtn === btn.id;
          return (
            <TouchableOpacity
              key={btn.id}
              style={[s.btn, {
                backgroundColor: isActive ? btn.color : isWrong ? '#ff0000' : btn.dark,
                transform: [{ scale: isActive ? 1.08 : 1 }],
                shadowColor: isActive ? btn.color : 'transparent',
                shadowOpacity: isActive ? 0.8 : 0,
                shadowRadius: 12,
                elevation: isActive ? 12 : 4,
              }]}
              onPress={() => handlePress(btn.id)}
              activeOpacity={0.8}
            >
              <Text style={s.btnEmoji}>{btn.emoji}</Text>
              {phase === 'input' && (
                <Text style={[s.btnLabel, { color: '#ffffff99' }]}>{btn.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* İpucu */}
      {phase === 'show' && sequence.length > 5 && (
        <Text style={[s.tip, { color: C.textSecondary }]}>💡 Uzun sekanslar için ritme odaklan!</Text>
      )}
    </View>
  );
}

const BTN_SIZE = 150;

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  roundBadge: { alignItems: 'center', backgroundColor: C.bgSecondary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, minWidth: 60 },
  roundLabel: { color: C.textSecondary, fontSize: 10, fontFamily: 'Nunito-Bold', letterSpacing: 1 },
  roundNum: { fontSize: 26, fontFamily: 'Nunito-ExtraBold' },
  center: { flex: 1, alignItems: 'center' },
  phaseMsg: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  progress: { fontFamily: 'Nunito-Regular', fontSize: 13, marginTop: 4 },
  countNum: { fontSize: 36, fontFamily: 'Nunito-ExtraBold', marginTop: 4 },
  lives: { flexDirection: 'row', gap: 4 },
  heart: { fontSize: 20 },
  seqRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 20, paddingHorizontal: 20, flexWrap: 'wrap' },
  seqDot: { height: 10, borderRadius: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  btn: {
    width: BTN_SIZE, height: BTN_SIZE, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  btnEmoji: { fontSize: 52 },
  btnLabel: { fontSize: 13, fontFamily: 'Nunito-Bold', marginTop: 6 },
  tip: { textAlign: 'center', fontFamily: 'Nunito-Regular', fontSize: 12, marginTop: 16, paddingHorizontal: 24 },
});