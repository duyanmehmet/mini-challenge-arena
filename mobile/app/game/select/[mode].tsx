import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { useUserStore } from '../../../src/store/userStore';
import { Colors } from '../../../src/constants/colors';
import { GAME_MODES, type GameModeId } from '../../../src/constants/gameModes';

const HOW_TO_PLAY: Record<GameModeId, string> = {
  reflex:   "3 şeritte yukarıdan düşen hedeflere dokun! Hit-zone'a gelince dokun. PERFECT vuruş bonus puan. Bomba = -1 can, Yıldız = +30p.",
  memory:   "Simon Says! 4 renkli buton sırasını ezberle, aynı sırayla tekrarla. 3 can hakkın var. Dizi uzadıkça hızlanır!",
  football: "Sürükle → şut yap! Güç metresini izle. Üst köşe = 100p. Kaleci combo'ya göre hızlanır. Bölge butonuna bas!",
  word:     "Verilen harflerden Türkçe kelimeler bul. 3 harf = 10p, 7+ harf = 200p. Tüm harfleri kullanan kelime 2x puan! Kelimelerin anlamlarını da öğren!",
  escape:   "◀ ▶ butonlarıyla şerit değiştir! 🪙 coin topla, 🛡️ kalkan al, ⚡ hız bonusu kazan. Engele çarpma!",
  math:     "İşlemi hızlıca çöz, 4 seçenekten birini seç! Seviye arttıkça sayılar büyür. Seri yapınca bonus puan!",
  english:  "İngilizce kelimeyi gör, 4 seçenekten Türkçe karşılığını bul! Kolay=10p, Orta=20p, Zor=35p. 2+ seri yapınca bonus puan. 60 saniye!",
};

export default function ModeSelectScreen() {
  const { mode } = useLocalSearchParams<{ mode: GameModeId }>();
  const { theme } = useSettingsStore();
  const { personalBests } = useUserStore();
  const C = Colors[theme];

  const cfg = GAME_MODES.find((m) => m.id === mode);
  if (!cfg) return null;

  const pb = personalBests.find((p) => p.mode === mode);

  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>

        {/* Geri */}
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>

        {/* Mod başlığı */}
        <View style={[s.iconBg, { backgroundColor: cfg.color + '22' }]}>
          <Text style={s.bigIcon}>{cfg.icon}</Text>
        </View>
        <Text style={[s.modeName, { color: C.textPrimary }]}>{cfg.name}</Text>
        <Text style={[s.modeDesc, { color: C.textSecondary }]}>{cfg.description}</Text>

        {/* Kişisel rekor */}
        {pb && (
          <View style={[s.pbCard, { backgroundColor: C.bgSecondary, borderColor: cfg.color }]}>
            <Text style={[s.pbLabel, { color: C.textSecondary }]}>KİŞİSEL REKORUN</Text>
            <Text style={[s.pbScore, { color: cfg.color }]}>🏆 {pb.score.toLocaleString('tr-TR')}</Text>
          </View>
        )}

        {/* Nasıl oynanır */}
        <View style={[s.howCard, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
          <Text style={[s.howTitle, { color: C.textPrimary }]}>📋 Nasıl Oynanır?</Text>
          <Text style={[s.howText, { color: C.textSecondary }]}>{HOW_TO_PLAY[mode as GameModeId]}</Text>
        </View>

        {/* Süre bilgisi */}
        <View style={[s.infoRow, { backgroundColor: C.bgSecondary }]}>
          <View style={s.infoItem}>
            <Text style={[s.infoVal, { color: cfg.color }]}>
              {cfg.duration > 0 ? `${cfg.duration}s` : '∞'}
            </Text>
            <Text style={[s.infoLabel, { color: C.textSecondary }]}>Süre</Text>
          </View>
          <View style={[s.divider, { backgroundColor: C.border }]} />
          <View style={s.infoItem}>
            <Text style={[s.infoVal, { color: cfg.color }]}>
              {pb ? `#${pb.score}` : '—'}
            </Text>
            <Text style={[s.infoLabel, { color: C.textSecondary }]}>En İyi</Text>
          </View>
        </View>

      </ScrollView>

      {/* Oyna butonu */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.playBtn, { backgroundColor: cfg.color }]}
          onPress={() => router.replace(`/game/${mode}`)}
        >
          <Text style={s.playText}>▶ Oyna</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  content: { padding: 20, alignItems: 'center', paddingBottom: 100 },
  back: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  iconBg: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bigIcon: { fontSize: 60 },
  modeName: { fontSize: 26, fontFamily: 'Nunito-ExtraBold', marginBottom: 8 },
  modeDesc: { fontSize: 15, fontFamily: 'Nunito-Regular', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  pbCard: { width: '100%', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, marginBottom: 16 },
  pbLabel: { fontSize: 11, fontFamily: 'Nunito-Bold', letterSpacing: 1, marginBottom: 4 },
  pbScore: { fontSize: 28, fontFamily: 'Nunito-ExtraBold' },
  howCard: { width: '100%', borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  howTitle: { fontFamily: 'Nunito-Bold', fontSize: 15, marginBottom: 10 },
  howText: { fontFamily: 'Nunito-Regular', fontSize: 14, lineHeight: 22 },
  infoRow: { width: '100%', borderRadius: 14, flexDirection: 'row', padding: 16 },
  infoItem: { flex: 1, alignItems: 'center' },
  infoVal: { fontSize: 22, fontFamily: 'Nunito-ExtraBold' },
  infoLabel: { fontSize: 12, fontFamily: 'Nunito-Regular', marginTop: 4 },
  divider: { width: 1, marginHorizontal: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32, backgroundColor: C.bgPrimary + 'ee' },
  playBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  playText: { color: '#fff', fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
});