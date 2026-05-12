import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import { assetService } from '../../../services/asset.service';
import { ScoreBar } from '../ScoreBar';
import { TimerBar } from '../TimerBar';

const STARTER_WORDS = ['ELMA','MASA','ARABA','KALEM','BULUT','DENIZ','KALE','ORMAN','BALIK','KITAP'];

// Büyük kelime listesinden türetilmiş basit doğrulama
const VALID: Set<string> = new Set([
  'ELMA','ARABA','ABA','ALAN','ALEV','ANLAM','ARAZI','ARPA',
  'BALIK','BALON','BANKA','BAR','BARAJ','BAYRAK','BEBEK',
  'BULUT','BURUN','CAN','CEKET','DENIZ','DERIN','DEVIR',
  'EL','ELMA','ENGEL','ERDEM','FAYDA','GAZ','GEL','GIT',
  'GOL','GOZ','GUL','HALK','HAN','HAT','HAYAT','HIZ',
  'IHBAR','INCI','KAL','KALEM','KALE','KAN','KAR','KARA',
  'KARTAL','KASIM','KAZAN','KIR','KITAP','KOL','KOM',
  'KURAL','LAS','LIG','MAL','MASA','MERAK','NESNE','NUR',
  'OKUL','ORMAN','OYUN','PAR','PARKA','ROL','SAL','SALON',
  'SAR','SER','SON','SOR','TAK','TAM','TAN','TAR','TARIH',
  'TEK','TEN','TOP','TUR','ULUSAL','UYUM','VAR','VER',
  'YAK','YAL','YAN','YAR','YAZ','YER','YOL','ZAM','ZOR',
  'ARMA','SERA','BELA','BALE','KENAR','ASKER','MASAL',
  'CANAL','RADAR','ATLAS','MODAL','SEZON','PUAN','KRON',
]);

interface ChainEntry { word: string; letter: string }

interface Props { onEnd: () => void }

export function ChainMode({ onEnd }: Props) {
  const { addScore, incrementCombo, resetCombo, score, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const starter = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
  const [chain, setChain] = useState<ChainEntry[]>([{ word: starter, letter: starter[0] }]);
  const [input, setInput]     = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const [shakeAnim]           = useState(new Animated.Value(0));
  const endCalled = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const lastWord  = chain[chain.length - 1].word;
  const needLetter = lastWord[lastWord.length - 1];

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!endCalled.current) { endCalled.current = true; onEnd(); }
      return;
    }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    const word = input.toUpperCase().trim();
    setInput('');

    if (word.length < 3) {
      setMessage('⚠️ En az 3 harf!'); shake(); return;
    }
    if (word[0] !== needLetter) {
      assetService.playSound('miss'); shake();
      setMessage(`❌ "${needLetter}" harfiyle başlamalı!`);
      resetCombo(); return;
    }
    if (chain.some((c) => c.word === word)) {
      shake(); setMessage('🔁 Bu kelime zaten kullanıldı!'); return;
    }
    if (!VALID.has(word)) {
      assetService.playSound('miss'); shake();
      setMessage('❌ Geçersiz kelime!');
      resetCombo(); return;
    }

    const pts = word.length * 15 + combo * 5;
    addScore(pts);
    incrementCombo();
    assetService.playSound(word.length >= 6 ? 'combo' : 'hit');
    assetService.vibrate(word.length >= 6 ? [0, 40, 20, 60] : 25);
    setChain((c) => [...c, { word, letter: word[0] }]);
    setMessage(`+${pts} puan!`);
    setTimeout(() => setMessage(''), 800);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const s = styles(C);

  return (
    <View style={s.root}>
      <ScoreBar />
      <View style={s.timerWrap}>
        <TimerBar duration={45} isPlaying={true} onTimeUp={() => {
          if (!endCalled.current) { endCalled.current = true; onEnd(); }
        }} />
      </View>

      {/* Zincir kuralı */}
      <View style={s.ruleBox}>
        <Text style={[s.ruleText, { color: C.textSecondary }]}>Son kelime: </Text>
        <Text style={[s.ruleWord, { color: C.accentRed }]}>{lastWord}</Text>
        <Text style={[s.ruleText, { color: C.textSecondary }]}> → </Text>
        <View style={[s.letterBadge, { backgroundColor: C.accentTeal + '33', borderColor: C.accentTeal }]}>
          <Text style={[s.letterText, { color: C.accentTeal }]}>{needLetter}</Text>
        </View>
        <Text style={[s.ruleText, { color: C.textSecondary }]}> ile başla!</Text>
      </View>

      {/* Zincir listesi */}
      <ScrollView ref={scrollRef} style={s.chainList} showsVerticalScrollIndicator={false}>
        {chain.map((entry, i) => (
          <View key={i} style={s.chainRow}>
            {i > 0 && <Text style={[s.arrow, { color: C.textSecondary }]}>↓</Text>}
            <View style={[s.wordChip, {
              backgroundColor: i === chain.length - 1 ? C.accentRed + '22' : C.bgSecondary,
              borderColor: i === chain.length - 1 ? C.accentRed : C.border,
            }]}>
              <Text style={[s.wordText, { color: i === chain.length - 1 ? C.accentRed : C.textPrimary }]}>
                {entry.word}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Mesaj */}
      {message ? (
        <Animated.Text style={[s.message, {
          color: message.includes('+') ? C.success : C.danger,
          transform: [{ translateX: shakeAnim }],
        }]}>{message}</Animated.Text>
      ) : null}

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.accentTeal }]}
          value={input}
          onChangeText={(t) => setInput(t.toUpperCase())}
          placeholder={`"${needLetter}" ile başlayan kelime...`}
          placeholderTextColor={C.textSecondary}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
          autoFocus
        />
        <TouchableOpacity style={[s.sendBtn, { backgroundColor: C.accentRed }]} onPress={handleSubmit}>
          <Text style={s.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPrimary },
  timerWrap: { paddingHorizontal: 16, marginVertical: 4 },
  ruleBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, flexWrap: 'wrap' },
  ruleText: { fontFamily: 'Nunito-Regular', fontSize: 14 },
  ruleWord: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  letterBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5 },
  letterText: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  chainList: { flex: 1, paddingHorizontal: 20 },
  chainRow: { alignItems: 'center', marginBottom: 2 },
  arrow: { fontSize: 14, marginVertical: 1 },
  wordChip: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, alignSelf: 'flex-start' },
  wordText: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  message: { textAlign: 'center', fontFamily: 'Nunito-ExtraBold', fontSize: 16, marginVertical: 6 },
  inputRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  input: { flex: 1, borderRadius: 14, padding: 14, fontSize: 17, borderWidth: 2, fontFamily: 'Nunito-Bold' },
  sendBtn: { borderRadius: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 24, fontWeight: '900' },
});