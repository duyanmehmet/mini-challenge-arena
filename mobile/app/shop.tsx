import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Alert,
} from 'react-native';
import { admobService } from '../src/services/admob.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import api from '../src/services/api';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GOLD  = '#f59e0b';
const GREEN = '#22c55e';
const RED   = '#ef4444';
const BORDER= '#2e2b5a';

const COIN_PACKAGES = [
  { id: 'coins_100',  coins: 100,   price: '₺9,99',  icon: '🪙', popular: false },
  { id: 'coins_500',  coins: 500,   price: '₺39,99', icon: '💰', popular: true  },
  { id: 'coins_1200', coins: 1200,  price: '₺79,99', icon: '🏆', popular: false },
  { id: 'coins_3000', coins: 3000,  price: '₺179,99',icon: '👑', popular: false },
];

function PressCard({ onPress, style, children }: { onPress: () => void; style?: any; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 60, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  };
  return (
    <TouchableOpacity onPress={press} activeOpacity={1}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const { user, addCoins } = useUserStore();
  const [adLoading,  setAdLoading]  = useState(false);
  const [hearts,     setHearts]     = useState<number>(5);
  const [maxHearts,  setMaxHearts]  = useState<number>(5);
  const [nextHeart,  setNextHeart]  = useState<number | null>(null);

  useEffect(() => {
    api.get('/lig/current')
      .then(r => {
        setHearts(r.data?.hearts ?? 5);
        setMaxHearts(r.data?.maxHearts ?? 5);
        setNextHeart(r.data?.nextHeartMinutes ?? null);
      })
      .catch(() => {});
  }, []);

  const handleBuyCoin = (pkg: typeof COIN_PACKAGES[0]) => {
    Alert.alert(
      '🏪 Satın Al',
      `${pkg.coins} Coin — ${pkg.price}\n\nGerçek ödeme sistemi yakında aktif olacak.\nŞu an test modunda coin ekleniyor.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Test: Ekle', onPress: () => {
            addCoins(pkg.coins);
            Alert.alert('✅ Eklendi (Test)', `${pkg.coins} 🪙 hesabına eklendi!`);
          },
        },
      ]
    );
  };

  const handleWatchAdCoins = async () => {
    setAdLoading(true);
    try {
      await admobService.showRewarded(() => {
        addCoins(50);
        Alert.alert('Teşekkürler!', '+50 🪙 coin kazandın!');
      });
    } catch {
      Alert.alert('Reklam Yüklenemedi', 'Lütfen daha sonra tekrar dene.');
    } finally {
      setAdLoading(false);
    }
  };

  const handleWatchAdLife = async () => {
    setAdLoading(true);
    try {
      await admobService.showRewarded(async () => {
        try {
          const res = await api.post('/lig/revive');
          const newH = res.data?.hearts ?? Math.min(hearts + 1, maxHearts);
          setHearts(newH);
          setNextHeart(null);
          Alert.alert('Harika!', `+1 ❤️ Kalp kazandın! (${newH}/${maxHearts})`);
        } catch {
          Alert.alert('Hata', 'Kalp yenilenemedi.');
        }
      });
    } catch {
      Alert.alert('Reklam Yüklenemedi', 'Lütfen daha sonra tekrar dene.');
    } finally {
      setAdLoading(false);
    }
  };

  const handleBuyLifeCoins = async () => {
    if ((user?.coins ?? 0) < 50) {
      Alert.alert('Yetersiz Coin', 'Bu işlem için 50 🪙 gerekiyor.');
      return;
    }
    try {
      addCoins(-50);
      await api.post('/lig/revive');
      Alert.alert('Başarılı!', '+1 ❤️ can kazandın! (-50 🪙)');
    } catch {
      addCoins(50); // geri yükle
      Alert.alert('Hata', 'Can yenilenemedi.');
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>🏪 Mağaza</Text>
        <View style={s.coinBadge}>
          <Text style={s.coinTxt}>🪙 {(user?.coins ?? 0).toLocaleString('tr-TR')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Kalp Bölümü */}
        <Text style={s.sectionTitle}>❤️ Kalp Sistemi</Text>

        {/* Mevcut kalp durumu */}
        <View style={s.heartStatusCard}>
          <View style={s.heartStatusTop}>
            <Text style={s.heartStatusLabel}>Mevcut Kalplerini</Text>
            <Text style={s.heartStatusCount}>{hearts}/{maxHearts}</Text>
          </View>
          <View style={s.heartIcons}>
            {Array.from({ length: maxHearts }).map((_, i) => (
              <Text key={i} style={{ fontSize: 22, opacity: i < hearts ? 1 : 0.2 }}>❤️</Text>
            ))}
          </View>
          {hearts < maxHearts && nextHeart && (
            <Text style={s.heartRegen}>⏳ {nextHeart} dk sonra +1 kalp otomatik gelir</Text>
          )}
          {hearts >= maxHearts && (
            <Text style={[s.heartRegen, { color: GREEN }]}>✅ Kalplerini dolu!</Text>
          )}
          {/* Önizleme */}
          {hearts < maxHearts && (
            <View style={s.heartPreview}>
              <Text style={s.heartPreviewTxt}>+1 eklersen: </Text>
              <View style={s.heartPreviewRow}>
                {Array.from({ length: maxHearts }).map((_, i) => (
                  <Text key={i} style={{ fontSize: 16, opacity: i < hearts + 1 ? 1 : 0.2 }}>❤️</Text>
                ))}
              </View>
              <Text style={[s.heartPreviewTxt, { color: GREEN }]}> → {hearts + 1}/{maxHearts}</Text>
            </View>
          )}
        </View>

        <View style={s.livesRow}>
          {/* Reklam ile kalp */}
          <PressCard onPress={handleWatchAdLife} style={[s.lifeCard, { opacity: hearts >= maxHearts ? 0.5 : 1 }]}>
            <View style={[s.lifeIconBg, { backgroundColor: '#22c55e22' }]}>
              <Text style={{ fontSize: 32 }}>📺</Text>
            </View>
            <Text style={s.lifeTitle}>Reklam İzle</Text>
            <Text style={s.lifeSub}>+1 Kalp kazan</Text>
            <View style={[s.lifeBtn, { backgroundColor: GREEN }]}>
              <Text style={s.lifeBtnTxt}>Ücretsiz</Text>
            </View>
          </PressCard>

          {/* Coin ile kalp */}
          <PressCard onPress={handleBuyLifeCoins} style={[s.lifeCard, { opacity: hearts >= maxHearts ? 0.5 : 1 }]}>
            <View style={[s.lifeIconBg, { backgroundColor: '#f59e0b22' }]}>
              <Text style={{ fontSize: 32 }}>🪙</Text>
            </View>
            <Text style={s.lifeTitle}>Coin Harca</Text>
            <Text style={s.lifeSub}>+1 Kalp kazan</Text>
            <View style={[s.lifeBtn, { backgroundColor: GOLD }]}>
              <Text style={[s.lifeBtnTxt, { color: '#000' }]}>50 🪙</Text>
            </View>
          </PressCard>
        </View>

        {/* Ücretsiz Coin */}
        <Text style={s.sectionTitle}>🎁 Ücretsiz Coin</Text>
        <TouchableOpacity style={s.adCard} onPress={handleWatchAdCoins} disabled={adLoading}>
          <View style={s.adLeft}>
            <Text style={{ fontSize: 32 }}>📺</Text>
            <View>
              <Text style={s.adTitle}>Reklam İzle</Text>
              <Text style={s.adSub}>Her reklamda +50 coin kazan</Text>
            </View>
          </View>
          <View style={s.adBadge}>
            <Text style={s.adBadgeTxt}>{adLoading ? '...' : '+50 🪙'}</Text>
          </View>
        </TouchableOpacity>

        {/* Coin Paketleri */}
        <Text style={s.sectionTitle}>💰 Coin Paketleri</Text>
        <View style={s.packagesList}>
          {COIN_PACKAGES.map(pkg => (
            <PressCard key={pkg.id} onPress={() => handleBuyCoin(pkg)} style={[s.pkgRow, pkg.popular && s.pkgPopular]}>
              {pkg.popular && (
                <View style={s.popularBadge}><Text style={s.popularTxt}>EN POPÜLER</Text></View>
              )}
              <Text style={s.pkgIcon}>{pkg.icon}</Text>
              <View style={s.pkgInfo}>
                <Text style={s.pkgCoins}>{pkg.coins.toLocaleString('tr-TR')} Coin</Text>
                <Text style={s.pkgLabel}>{pkg.popular ? '🔥 En çok tercih edilen' : ''}</Text>
              </View>
              <View style={s.pkgPriceBtn}>
                <Text style={s.pkgPrice}>{pkg.price}</Text>
              </View>
            </PressCard>
          ))}
        </View>

        <View style={s.notice}>
          <Text style={s.noticeTxt}>💡 Coinler lig canı almak ve düello bahisleri için kullanılır.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { padding: 16 },

  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:   { width: 60 },
  backTxt:   { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },
  title:     { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },
  coinBadge: { backgroundColor: GOLD + '22', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: GOLD + '44' },
  coinTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: GOLD },

  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT, marginBottom: 4, marginTop: 20 },
  sectionSub:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginBottom: 14 },

  // Kalp durum kartı
  heartStatusCard: { backgroundColor: CARD, borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: '#ef444444', marginBottom: 12 },
  heartStatusTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heartStatusLabel:{ fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED },
  heartStatusCount:{ fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT },
  heartIcons:      { flexDirection: 'row', gap: 6 },
  heartRegen:      { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  heartPreview:    { flexDirection: 'row', alignItems: 'center', backgroundColor: GREEN + '15', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: GREEN + '33' },
  heartPreviewTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: MUTED },
  heartPreviewRow: { flexDirection: 'row', gap: 2 },

  // Can kartları
  livesRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  lifeCard: { flex: 1, backgroundColor: CARD, borderRadius: 18, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: BORDER },
  lifeIconBg: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  lifeTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  lifeSub:    { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  lifeBtn:    { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  lifeBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: TEXT },

  // Reklam kartı
  adCard:   { backgroundColor: CARD, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: GREEN + '44', marginBottom: 8 },
  adLeft:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  adTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT },
  adSub:    { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  adBadge:  { backgroundColor: GREEN + '22', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  adBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: GREEN },

  // Paketler — liste stili (grid kaldırıldı)
  packagesList: { gap: 10 },
  pkgRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER, gap: 12 },
  pkgPopular:  { borderColor: GOLD, borderWidth: 2 },
  popularBadge:{ position: 'absolute', top: -10, right: 12, backgroundColor: GOLD, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, zIndex: 1 },
  popularTxt:  { fontFamily: 'Nunito-ExtraBold', fontSize: 9, color: '#000', letterSpacing: 0.5 },
  pkgIcon:     { fontSize: 32 },
  pkgInfo:     { flex: 1 },
  pkgCoins:    { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: GOLD },
  pkgLabel:    { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, marginTop: 2 },
  pkgPriceBtn: { backgroundColor: PURP, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  pkgPrice:    { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },

  notice:    { backgroundColor: CARD, borderRadius: 14, padding: 14, marginTop: 16, borderWidth: 1, borderColor: BORDER },
  noticeTxt: { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, textAlign: 'center' },
});
