import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CATEGORIES, CATEGORY_GROUPS, getCategoriesByGroup } from '../src/constants/categories';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const BG   = '#0d0d1a';
const CARD = '#13132a';
const TEXT = '#ffffff';
const MUTED= '#7c7aaa';

export default function KategorilerScreen() {
  return (
    <SafeAreaView style={s.root}>
      {/* Başlık */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>Kategori Seç</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={CATEGORY_GROUPS}
        keyExtractor={g => g.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderItem={({ item: group }) => {
          const cats = getCategoriesByGroup(group.id);
          return (
            <View style={s.group}>
              <Text style={s.groupTitle}>{group.icon} {group.label}</Text>
              <View style={s.grid}>
                {cats.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[s.card, { borderColor: cat.color + '55' }]}
                    onPress={() => router.push(`/game/select/${cat.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.iconBg, { backgroundColor: cat.color + '22' }]}>
                      <Text style={{ fontSize: 32 }}>{cat.icon}</Text>
                    </View>
                    <Text style={s.catName}>{cat.name}</Text>
                    <Text style={[s.catCount, { color: cat.color }]}>{cat.questionCount}+ soru</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  back:  { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },

  group: { marginBottom: 28 },
  groupTitle: {
    fontFamily: 'Nunito-ExtraBold', fontSize: 16,
    color: TEXT, marginBottom: 14,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  card: {
    width: CARD_W,
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  iconBg: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  catName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: TEXT, textAlign: 'center' },
  catCount: { fontFamily: 'Nunito-Regular', fontSize: 12, textAlign: 'center' },
});
