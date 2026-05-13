import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { useUserStore } from '../../../src/store/userStore';
import { Colors } from '../../../src/constants/colors';
import { CATEGORIES, type CategoryId } from '../../../src/constants/categories';

export default function CategorySelectScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const { theme } = useSettingsStore();
  const { personalBests } = useUserStore();
  const C = Colors[theme];

  const cat = CATEGORIES.find((c) => c.id === mode);
  if (!cat) return null;

  const pb = personalBests.find((p) => p.mode === mode);
  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>

        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>

        {/* İkon & Başlık */}
        <View style={[s.iconBg, { backgroundColor: cat.color + '22' }]}>
          <Text style={s.bigIcon}>{cat.icon}</Text>
        </View>
        <Text style={[s.catName, { color: C.textPrimary }]}>{cat.name}</Text>
        <View style={[s.tagBadge, { backgroundColor: cat.color + '22', borderColor: cat.color }]}>
          <Text style={[s.tagText, { color: cat.color }]}>{cat.group === 'culture' ? '🏛️ Kültür & Bilim' : '⭐ Özel'}</Text>
        </View>
        <Text style={[s.catDesc, { color: C.textSecondary }]}>{cat.description}</Text>

        {/* Kişisel Rekor */}
        {pb && (
          <View style={[s.pbCard, { backgroundColor: C.bgSecondary, borderColor: cat.color }]}>
            <Text style={[s.pbLabel, { color: C.textSecondary }]}>KİŞİSEL REKORUN</Text>
            <Text style={[s.pbScore, { color: cat.color }]}>🏆 {pb.score.toLocaleString('tr-TR')}</Text>
          </View>
        )}

        {/* Bilgi kartları */}
        <View style={s.infoRow}>
          <View style={[s.infoCard, { backgroundColor: C.bgSecondary }]}>
            <Text style={[s.infoVal, { color: cat.color }]}>⏱ 60s</Text>
            <Text style={[s.infoLabel, { color: C.textSecondary }]}>Süre</Text>
          </View>
          <View style={[s.infoCard, { backgroundColor: C.bgSecondary }]}>
            <Text style={[s.infoVal, { color: cat.color }]}>{cat.questionCount}+</Text>
            <Text style={[s.infoLabel, { color: C.textSecondary }]}>Soru</Text>
          </View>
          <View style={[s.infoCard, { backgroundColor: C.bgSecondary }]}>
            <Text style={[s.infoVal, { color: cat.color }]}>{pb ? `${pb.score}` : '—'}</Text>
            <Text style={[s.infoLabel, { color: C.textSecondary }]}>En İyi</Text>
          </View>
        </View>

        {/* Nasıl oynanır */}
        <View style={[s.howCard, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
          <Text style={[s.howTitle, { color: C.textPrimary }]}>📋 Nasıl Oynanır?</Text>
          <Text style={[s.howText, { color: C.textSecondary }]}>
            {`Her soruyu okuyarak 4 seçenekten doğrusunu seç! ⚡ Hızlı cevap daha fazla puan kazandırır (2sn=30p, 6sn=20p, 12sn+=10p). 3+ seri yapınca bonus puan. 60 saniyede ne kadar doğru yapabilirsin?`}
          </Text>
        </View>

      </ScrollView>

      {/* Oyna Butonu */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.playBtn, { backgroundColor: cat.color }]}
          onPress={() => router.replace(`/game/${mode}` as any)}
        >
          <Text style={s.playText}>▶ Oyna</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  content: { padding: 20, alignItems: 'center', paddingBottom: 120 },
  back: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  iconBg: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  bigIcon: { fontSize: 54 },
  catName: { fontSize: 26, fontFamily: 'Nunito-ExtraBold', marginBottom: 8, textAlign: 'center' },
  tagBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, marginBottom: 12 },
  tagText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
  catDesc: { fontSize: 14, fontFamily: 'Nunito-Regular', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  pbCard: { width: '100%', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, marginBottom: 16 },
  pbLabel: { fontSize: 11, fontFamily: 'Nunito-Bold', letterSpacing: 1, marginBottom: 4 },
  pbScore: { fontSize: 28, fontFamily: 'Nunito-ExtraBold' },
  infoRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 16 },
  infoCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  infoVal: { fontSize: 18, fontFamily: 'Nunito-ExtraBold', marginBottom: 2 },
  infoLabel: { fontSize: 11, fontFamily: 'Nunito-Regular' },
  howCard: { width: '100%', borderRadius: 14, padding: 16, borderWidth: 1 },
  howTitle: { fontFamily: 'Nunito-Bold', fontSize: 15, marginBottom: 10 },
  howText: { fontFamily: 'Nunito-Regular', fontSize: 14, lineHeight: 22 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32, backgroundColor: C.bgPrimary + 'ee' },
  playBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  playText: { color: '#fff', fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
});
