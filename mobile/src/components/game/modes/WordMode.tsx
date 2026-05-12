import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import WORD_LIST from '../../../data/turkish-words.json';
import { TimerBar } from '../TimerBar';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { assetService } from '../../../services/asset.service';
import { getWordHint } from '../../../utils/wordHints';

const CONSONANTS = 'BCDFGHJKLMNPRSTVYZÇŞ';
const VOWELS = 'AEIİOÖUÜ';
const WORD_POINTS: Record<number, number> = { 3: 10, 4: 25, 5: 50, 6: 100, 7: 200 };

// JSON'dan Set oluştur
const VALID_WORDS = new Set<string>((WORD_LIST as string[]).map((w) => w.toUpperCase()));

function randomLetters(): string[] {
  const letters: string[] = [];
  for (let i = 0; i < 4; i++) letters.push(VOWELS[Math.floor(Math.random() * VOWELS.length)]);
  for (let i = 0; i < 5; i++) letters.push(CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]);
  return letters.sort(() => Math.random() - 0.5);
}

interface Props { onEnd: () => void }

export function WordMode({ onEnd }: Props) {
  const { addScore, score, combo } = useGameStore();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [letters] = useState(randomLetters);
  const [input, setInput] = useState('');
  const [found, setFound] = useState<{ word: string; pts: number; hint: string | null }[]>([]);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const endCalled = useRef(false);

  const handleSubmit = () => {
    const word = input.toUpperCase().trim();
    setInput('');
    setHint(null);
    if (word.length < 3) { setMessage('⚠️ En az 3 harf!'); return; }
    if (found.some((f) => f.word === word)) { setMessage('✓ Zaten buldun!'); return; }

    const avail = [...letters];
    let valid = true;
    for (const ch of word) {
      const idx = avail.indexOf(ch);
      if (idx === -1) { valid = false; break; }
      avail.splice(idx, 1);
    }
    if (!valid) { assetService.playSound('miss'); setMessage('❌ Bu harfler mevcut değil!'); return; }
    if (!VALID_WORDS.has(word)) { assetService.playSound('miss'); setMessage('❌ Geçersiz kelime!'); return; }

    const pts = WORD_POINTS[Math.min(word.length, 7)] ?? 200;
    const bonus = word.length >= letters.length ? 2 : 1;
    const total = pts * bonus;
    addScore(total);
    assetService.playSound(bonus > 1 ? 'combo' : 'hit');
    assetService.vibrate(bonus > 1 ? [0, 50, 30, 80] : 40);

    const wordHint = getWordHint(word);
    setFound((f) => [...f, { word, pts: total, hint: wordHint }]);
    setMessage(`+${total} puan${bonus > 1 ? ' 🎉 Bonus!' : ''}`);
    if (wordHint) setHint(wordHint);
    setTimeout(() => { setMessage(''); setHint(null); }, 2000);
  };

  const s = styles(C);

  return (
    <View style={s.container}>
      <ScoreBar />
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <TimerBar
          duration={30}
          isPlaying={true}
          onTimeUp={() => {
            if (!endCalled.current) {
              endCalled.current = true;
              onEnd();
            }
          }} 
        />
      </View>

      <ComboBar combo={combo} />

      {/* Harfler */}
      <View style={s.lettersRow}>
        {letters.map((l, i) => (
          <View key={i} style={[s.letterTile, { backgroundColor: C.bgTertiary }]}>
            <Text style={[s.letterText, { color: C.textPrimary }]}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
          value={input}
          onChangeText={(t) => setInput(t.toUpperCase())}
          placeholder="Kelime yaz..."
          placeholderTextColor={C.textSecondary}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
        />
        <TouchableOpacity style={[s.sendBtn, { backgroundColor: C.accentRed }]} onPress={handleSubmit}>
          <Text style={s.sendText}>Gönder</Text>
        </TouchableOpacity>
      </View>

      {/* Mesaj + Kelime anlamı */}
      {message ? (
        <View style={[s.msgBox, { backgroundColor: message.includes('+') ? C.success + '22' : C.danger + '22' }]}>
          <Text style={[s.message, { color: message.includes('+') ? C.success : C.danger }]}>{message}</Text>
          {hint ? <Text style={[s.hintText, { color: C.textSecondary }]}>💡 {hint}</Text> : null}
        </View>
      ) : null}

      {/* Bulunan kelimeler */}
      <ScrollView style={s.foundList} showsVerticalScrollIndicator={false}>
        {found.map((item, i) => (
          <View key={i} style={[s.foundRow, { backgroundColor: C.bgSecondary }]}>
            <Text style={[s.foundWord, { color: C.accentTeal }]}>✓ {item.word}</Text>
            <Text style={[s.foundPts, { color: C.accentYellow }]}>+{item.pts}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, padding: 16 },
  lettersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 14, marginTop: 8 },
  letterTile: { width: 46, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontSize: 22, fontFamily: 'Nunito-ExtraBold' },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, borderRadius: 14, padding: 14, fontSize: 18, borderWidth: 1.5, fontFamily: 'Nunito-Bold' },
  sendBtn: { borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center', minWidth: 80 },
  sendText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 15 },
  msgBox: { borderRadius: 12, padding: 10, marginBottom: 8, alignItems: 'center' },
  message: { fontSize: 16, fontFamily: 'Nunito-ExtraBold' },
  hintText: { fontSize: 12, fontFamily: 'Nunito-Regular', marginTop: 4 },
  foundList: { flex: 1 },
  foundRow: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 10, padding: 10, marginBottom: 4 },
  foundWord: { fontFamily: 'Nunito-Bold', fontSize: 14 },
  foundPts: { fontFamily: 'Nunito-Bold', fontSize: 14 },
});
