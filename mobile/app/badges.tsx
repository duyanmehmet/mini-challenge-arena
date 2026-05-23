import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../src/store/userStore';

const BG   = '#ffffff';
const TEXT = '#111827';
const MUTED= '#9ca3af';
const PURP = '#6c3aed';

const ALL_BADGES: { id: string; icon: string; name: string; desc: string; color: string }[] = [
  { id: 'first_game',        icon: '🎮', name: 'İlk Adım',        desc: 'İlk oyununu tamamla',                    color: '#6c3aed' },
  { id: 'classic_complete',  icon: '📚', name: 'Kültür Ustası',   desc: 'Genel Kültür\'de 200+ puan al',          color: '#8b5cf6' },
  { id: 'all_categories',    icon: '🌍', name: 'Kaşif',           desc: 'Tüm kategorileri oyna',                  color: '#f59e0b' },
  { id: 'streak_3',          icon: '🔥', name: '3 Günlük Seri',   desc: '3 gün üst üste oyna',                    color: '#f97316' },
  { id: 'streak_7',          icon: '🔥', name: 'Haftalık Seri',   desc: '7 gün üst üste oyna',                    color: '#ef4444' },
  { id: 'streak_30',         icon: '💪', name: 'Azimli',          desc: '30 gün üst üste oyna',                   color: '#dc2626' },
  { id: 'level_10',          icon: '⭐', name: 'Seviye 10',        desc: '10. seviyeye ulaş',                      color: '#22c55e' },
  { id: 'level_25',          icon: '🌟', name: 'Seviye 25',        desc: '25. seviyeye ulaş',                      color: '#16a34a' },
  { id: 'level_50',          icon: '👑', name: 'Efsane',           desc: '50. seviyeye ulaş',                      color: '#ffd700' },
  { id: 'history_master',    icon: '🏺', name: 'Tarih Ustası',    desc: 'Tarih\'te 1000+ puan al',                color: '#c0392b' },
  { id: 'science_master',    icon: '🔬', name: 'Bilim İnsanı',    desc: 'Bilim\'de 1000+ puan al',                color: '#2980b9' },
  { id: 'geography_master',  icon: '🌍', name: 'Coğrafyacı',      desc: 'Coğrafya\'da 1000+ puan al',             color: '#27ae60' },
  { id: 'general_master',    icon: '💡', name: 'Genel Kültür',    desc: 'Genel Kültür\'de 1500+ puan al',         color: '#8e44ad' },
  { id: 'turkey_master',     icon: '🇹🇷', name: 'Anadolu Kartalı', desc: 'Türkiye\'de 1000+ puan al',             color: '#dc2626' },
  { id: 'cinema_master',     icon: '🎬', name: 'Sinefil',         desc: 'Sinema & TV\'de 1000+ puan al',          color: '#e91e8c' },
  { id: 'sports_master',     icon: '⚽', name: 'Sporcu',          desc: 'Spor\'da 1000+ puan al',                 color: '#16a085' },
  { id: 'art_master',        icon: '🎨', name: 'Sanatçı',         desc: 'Sanat\'ta 1000+ puan al',                color: '#9b59b6' },
  { id: 'medical_master',    icon: '🩺', name: 'Doktor',          desc: 'Tıbbi Terimler\'de 800+ puan al',        color: '#e74c3c' },
  { id: 'economy_master',    icon: '📈', name: 'Ekonomist',       desc: 'Ekonomi\'de 800+ puan al',               color: '#2ecc71' },
];

export default function BadgesScreen() {
  const { badges } = useUserStore();
  const earned = new Set(badges);
  const earnedList  = ALL_BADGES.filter(b => earned.has(b.id));
  const lockedList  = ALL_BADGES.filter(b => !earned.has(b.id));

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>🎖️ Rozetler</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Özet */}
        <View style={s.summaryCard}>
          <Text style={s.summaryNum}>{earnedList.length}</Text>
          <Text style={s.summaryLabel}>/ {ALL_BADGES.length} rozet kazanıldı</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${(earnedList.length / ALL_BADGES.length) * 100}%` as any }]} />
          </View>
        </View>

        {/* Kazanılanlar */}
        {earnedList.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>✅ Kazanılanlar ({earnedList.length})</Text>
            <View style={s.grid}>
              {earnedList.map(b => (
                <BadgeCard key={b.id} badge={b} earned />
              ))}
            </View>
          </View>
        )}

        {/* Kilitliler */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔒 Kilitliler ({lockedList.length})</Text>
          <View style={s.grid}>
            {lockedList.map(b => (
              <BadgeCard key={b.id} badge={b} earned={false} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BadgeCard({ badge, earned }: { badge: typeof ALL_BADGES[0]; earned: boolean }) {
  return (
    <View style={[s.card, !earned && s.cardLocked]}>
      <View style={[s.iconWrap, { backgroundColor: earned ? badge.color + '20' : '#f3f4f6' }]}>
        <Text style={{ fontSize: 28, opacity: earned ? 1 : 0.3 }}>{badge.icon}</Text>
      </View>
      <Text style={[s.badgeName, !earned && { color: MUTED }]} numberOfLines={1}>{badge.name}</Text>
      <Text style={s.badgeDesc} numberOfLines={2}>{badge.desc}</Text>
      {earned && <View style={s.earnedDot} />}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backBtn:{ fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: PURP, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title:  { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },

  summaryCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: '#f5f3ff', borderRadius: 18, padding: 20, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#ede9fe' },
  summaryNum:  { fontFamily: 'Nunito-ExtraBold', fontSize: 40, color: PURP },
  summaryLabel:{ fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  progressBar: { width: '100%', height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressFill:{ height: 6, backgroundColor: PURP, borderRadius: 3 },

  section:     { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle:{ fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT, marginBottom: 12 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  card: {
    width: '30%', flexGrow: 1,
    backgroundColor: '#fff', borderRadius: 16, padding: 12,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    position: 'relative',
  },
  cardLocked:  { opacity: 0.6 },
  iconWrap:    { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badgeName:   { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: TEXT, textAlign: 'center' },
  badgeDesc:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, textAlign: 'center', lineHeight: 15 },
  earnedDot:   { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
});
