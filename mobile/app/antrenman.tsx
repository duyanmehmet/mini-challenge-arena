import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CATEGORIES, CATEGORY_GROUPS, getCategoriesByGroup } from '../src/constants/categories';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const BG    = '#ffffff';
const CARD  = '#ffffff';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const BORDER= '#2e2b5a';

export default function AntrenmanScreen() {
  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>📚 Antrenman</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Açıklama */}
      <View style={s.infoCard}>
        <Text style={s.infoTxt}>15 Soru · Can yok · Sadece pratik</Text>
        <Text style={s.infoSub}>Kategori seç, istediğin kadar tekrar oyna.</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {CATEGORY_GROUPS.map(group => {
          const cats = getCategoriesByGroup(group.id);
          return (
            <View key={group.id} style={s.groupWrap}>
              <Text style={s.groupTitle}>{group.icon} {group.label}</Text>
              <View style={s.grid}>
                {cats.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[s.catCard, { borderColor: cat.color + '55' }]}
                    onPress={() => router.push({ pathname: `/game/${cat.id}` as any, params: { antrenmanMode: '1' } })}
                    activeOpacity={0.8}
                  >
                    <View style={[s.iconBg, { backgroundColor: cat.color + '22' }]}>
                      <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                    </View>
                    <Text style={s.catName}>{cat.shortName}</Text>
                    <Text style={[s.catCount, { color: cat.color }]}>{cat.questionCount}+ soru</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 20 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  backBtn:     { },
  backTxt:     { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  headerTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },

  infoCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: '#06b6d415', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#06b6d430', alignItems: 'center', gap: 4 },
  infoTxt:  { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#06b6d4' },
  infoSub:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },

  groupWrap:  { paddingHorizontal: 16, marginBottom: 20 },
  groupTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT, marginBottom: 12 },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  catCard:  { width: CARD_W, backgroundColor: '#fff', borderRadius: 18, padding: 14, borderWidth: 1.5, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  iconBg:   { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: TEXT, textAlign: 'center' },
  catCount: { fontFamily: 'Nunito-Regular', fontSize: 11, textAlign: 'center' },
});
