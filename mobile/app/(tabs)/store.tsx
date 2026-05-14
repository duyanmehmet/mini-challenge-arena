import { useState, useEffect } from 'react';
r 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { CoinDisplay } from '../../src/components/ui/CoinDisplay';
import { storeService, type Product } from '../../src/services/store.service';

export default function StoreScreen() {
  const { theme } = useSettingsStore();
  const { user, addCoins } = useUserStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const C = Colors[theme];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await storeService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    if (!user) return;
    setBuying(packId);
    try {
      const result = await storeService.purchaseCoins(packId);
      if (result?.coinsAdded) addCoins(result.coinsAdded);
      Alert.alert('Başarılı! 🎉', `${result?.coinsAdded ?? 0} coin hesabına eklendi.`);
    } catch {
      Alert.alert('Hata', 'Satın alma başarısız. Lütfen tekrar dene.');
    } finally {
      setBuying(null);
    }
  };

  const s = styles(C);

  if (loading) {
    return (
      <View style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.accentTeal} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.title}>🪙 Mağaza</Text>
          <CoinDisplay amount={user?.coins || 0} size="lg" />
        </View>

        <Text style={s.sectionTitle}>Coin Paketleri</Text>
        <View style={s.grid}>
          {products.map((p) => (
            <TouchableOpacity 
              key={p.id} 
              style={[s.pack, { backgroundColor: C.bgSecondary, borderColor: C.border }]}
              onPress={() => handlePurchase(p.id)}
              disabled={buying !== null}
            >
              <Text style={s.packEmoji}>{p.amount >= 1000 ? '💰' : p.amount >= 500 ? '💎' : '🪙'}</Text>
              <Text style={s.packAmount}>{p.amount} Coin</Text>
              <View style={[s.priceTag, { backgroundColor: C.accentTeal }]}>
                {buying === p.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.priceText}>{p.price} TL</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[s.infoBox, { backgroundColor: C.bgTertiary }]}>
          <Text style={[s.infoText, { color: C.textSecondary }]}>
            Satın aldığın coinleri yeni avatarlar ve liglerdeki özel özellikler için kullanabilirsin.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { color: C.textPrimary, fontSize: 28, fontFamily: 'Nunito-ExtraBold' },
  sectionTitle: { color: C.textPrimary, fontSize: 18, fontFamily: 'Nunito-Bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pack: { width: '48%', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, gap: 8 },
  packEmoji: { fontSize: 40, marginBottom: 4 },
  packAmount: { color: C.textPrimary, fontSize: 18, fontFamily: 'Nunito-ExtraBold' },
  priceTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  priceText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito-Bold' },
  infoBox: { marginTop: 30, padding: 20, borderRadius: 16 },
  infoText: { textAlign: 'center', fontSize: 13, fontFamily: 'Nunito-Regular', lineHeight: 18 },
});
