import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../../../store/gameStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Colors } from '../../../constants/colors';
import WORD_LIST from '../../../data/turkish-words.json';
import { TimerBar } from '../TimerBar';
import { ScoreBar } from '../ScoreBar';
import { ComboBar } from '../ComboBar';
import { assetService } from '../../../services/asset.service';

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
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const endCalled = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);

  const handleSubmit = () => {
    const word = input.toUpperCase().trim();
    setInput('');
    if (word.length < 3) { setMessage('En az 3 harf!'); return; }
    if (found.includes(word)) { setMessage('Zaten buldun!'); return; }

    // Harflerin mevcut olup olmadığını kontrol et
    const avail = [...letters];
    let valid = true;
    for (const ch of word) {
      const idx = avail.indexOf(ch);
      if (idx === -1) { valid = false; break; }
      avail.splice(idx, 1);
    }
    if (!valid) { assetService.playSound('miss'); setMessage('Bu harfler mevcut değil!'); return; }
    if (!VALID_WORDS.has(word)) { assetService.playSound('miss'); setMessage('Geçersiz kelime!'); return; }

    const pts = WORD_POINTS[Math.min(word.length, 7)] ?? 200;
    const bonus = word.length >= letters.length ? 2 : 1;
    addScore(pts * bonus);
    assetService.playSound(bonus > 1 ? 'combo' : 'hit');
    assetService.vibrate(bonus > 1 ? [0, 50, 30, 80] : 40);
    setFound((f) => [...f, word]);
    setMessage(`+${pts * bonus} puan${bonus > 1 ? ' (Bonus!)' : ''}`);
    setTimeout(() => setMessage(''), 1000);
  };

  const s = styles(C);

  return (
    <View style={s.container}>
      <ScoreBar />
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <TimerBar 
          duration={30} 
          isPlaying={isPlaying} 
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

      {message ? <Text style={[s.message, { color: message.includes('+') ? C.success : C.danger }]}>{message}</Text> : null}

      {/* Bulunan kelimeler */}
      <ScrollView style={s.foundList} showsVerticalScrollIndicator={false}>
        {found.map((w, i) => (
          <Text key={i} style={[s.foundWord, { color: C.accentTeal }]}>✓ {w}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary, padding: 20 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  score: { color: C.accentYellow, fontSize: 18, fontFamily: 'Nunito-Bold' },
  time: { fontSize: 18, fontFamily: 'Nunito-Bold' },
  lettersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  letterTile: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontSize: 20, fontFamily: 'Nunito-ExtraBold' },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, borderRadius: 12, padding: 12, fontSize: 16, borderWidth: 1 },
  sendBtn: { borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontFamily: 'Nunito-Bold' },
  message: { textAlign: 'center', fontSize: 16, fontFamily: 'Nunito-Bold', marginBottom: 8 },
  foundList: { flex: 1 },
  foundWord: { fontFamily: 'Nunito-Regular', fontSize: 14, marginBottom: 4 },
});
