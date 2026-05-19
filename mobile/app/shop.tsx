/**
 * Mağaza — store + API bağlantılı
 * app/shop.tsx
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../src/store/userStore';
import api from '../src/services/api';
import { Colors } from '../src/constants/theme';

const { width: W } = Dimensions.get('window');

const COIN_PACKAGES = [
  { id: 'p500',  amount: 500,  price: '₺19,99' },
  { id: 'p1200', amount: 1200, price: '₺39,99', bonus: '200' },
  { id: 'p2500', amount: 2500, price: '₺79,99', bonus: '500',  highlight: true },
  { id: 'p5500', amount: 5500, price: '₺159,99', bonus: '1500' },
];

const CoinPackCard: React.FC<{ pkg: typeof COIN_PACKAGES[0]; onPress: () => void }> = ({ pkg, onPress }) => {
  const sc = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale: sc }] }}>
      <TouchableOpacity
        style={[s.packCard, pkg.highlight && s.packCardHL]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.sequence([
            Animated.timing(sc, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.spring(sc, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
          ]).start();
          onPress();
        }}
        activeOpacity={1}
      >
        {pkg.highlight && <View style={s.popularBadge}><Text style={s.popularTxt}>⭐ Popüler</Text></View>}
        <View style={s.packLeft}>
          <Text style={{ fontSize: 26 }}>🪙</Text>
          <View>
            <Text style={s.packAmt}>{pkg.amount.toLocaleString('tr-TR')}</Text>
            {pkg.bonus && <Text style={s.packBonus}>+{pkg.bonus} bonus</Text>}
          </View>
        </View>
        <View style={[s.packPriceBtn, pkg.highlight && { backgroundColor: Colors.gold }]}>
          <Text style={[s.packPrice, pkg.highlight && { color: '#000' }]}>{pkg.price}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ShopScreen() {
  const { user, addCoins } = useUserStore();
  const [hearts,    setHearts]    = useState(5);
  const [maxHearts, setMaxHearts] = useState(5);
  const [nextHeart, setNextHeart] = useState<number | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    api.get('/lig/current').then(r => {
      setHearts(r.data?.hearts ?? 5);
      setMaxHearts(r.data?.maxHearts ?? 5);
      setNextHeart(r.data?.nextHeartMinutes ?? null);
    }).catch(() => {});
  }, []);

  const handleWatchAdLife = async () => {
    setAdLoading(true);
    setTimeout(async () => {
      try {
        const res = await api.post('/lig/revive');
        const newH = res.data?.hearts ?? Math.min(hearts + 1, maxHearts);
        setHearts(newH);
        Alert.alert('Harika!', `+1 ❤️ Kalp kazandın! (${newH}/${maxHearts})`);
      } catch { Alert.alert('Hata', 'Kalp yenilenemedi.'); }
      finally  { setAdLoading(false); }
    }, 1500);
  };

  const handleBuyLifeCoins = async () => {
    if ((user?.coins ?? 0) < 100) { Alert.alert('Yetersiz Coin', '100 🪙 gerekiyor.'); return; }
    if (hearts >= maxHearts) { Alert.alert('Dolu', 'Kalplerın zaten dolu!'); return; }
    try {
      addCoins(-100);
      const res = await api.post('/lig/revive');
      const newH = res.data?.hearts ?? Math.min(hearts + 1, maxHearts);
      setHearts(newH);
      Alert.alert('Başarılı!', `+1 ❤️ kalp kazandın! (${newH}/${maxHearts})`);
    } catch { addCoins(100); Alert.alert('Hata', 'Kalp yenilenemedi.'); }
  };

  const handleBuyCoin = (pkg: typeof COIN_PACKAGES[0]) => {
    Alert.alert('🏪 Satın Al', `${pkg.amount} Coin — ${pkg.price}\n\nGerçek ödeme yakında aktif. Şimdi test olarak ekleniyor.`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Test: Ekle', onPress: () => { addCoins(pkg.amount); Alert.alert('✅ Eklendi', `${pkg.amount} 🪙`); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🏪 Mağaza</Text>
        <View style={s.coinBadge}>
          <Text style={{ fontSize: 14 }}>🪙</Text>
          <Text style={s.coinTxt}>{(user?.coins ?? 0).toLocaleString('tr-TR')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* KALP DURUMU */}
        <Text style={s.sectionTitle}>❤️ Kalp Durumu</Text>
        <View style={s.heartCard}>
          {/* Kalp göstergesi */}
          <View style={s.heartPreviewRow}>
            {Array.from({ length: maxHearts }, (_, i) => (
              <Text key={i} style={{ fontSize: 24, opacity: i < hearts ? 1 : 0.2 }}>❤️</Text>
            ))}
          </View>
          <Text style={s.heartStatus}>{hearts} / {maxHearts} kalp</Text>
          {hearts < maxHearts && nextHeart && (
            <Text style={s.heartRegen}>⏳ {nextHeart} dk sonra +1 kalp otomatik</Text>
          )}
          {/* +1 preview */}
          {hearts < maxHearts && (
            <View style={s.heartPreviewAdd}>
              <Text style={s.heartPreviewTxt}>+1 eklersen: </Text>
              {Array.from({ length: maxHearts }, (_, i) => (
                <Text key={i} style={{ fontSize: 16, opacity: i < hearts + 1 ? 1 : 0.2 }}>❤️</Text>
              ))}
              <Text style={[s.heartPreviewTxt, { color: Colors.green }]}> {hearts + 1}/{maxHearts}</Text>
            </View>
          )}

          <View style={s.heartBtnsRow}>
            <TouchableOpacity style={s.heartBtnAd} onPress={handleWatchAdLife} disabled={adLoading} activeOpacity={0.85}>
              <View style={s.heartBtnLeft}>
                <View style={s.adIconBg}><Text style={{ fontSize: 20 }}>📺</Text></View>
                <View>
                  <Text style={s.heartBtnTitle}>Reklam İzle</Text>
                  <Text style={s.heartBtnSub}>+1 kalp kazan</Text>
                </View>
              </View>
              <View style={s.freeBadge}><Text style={s.freeBadgeTxt}>{adLoading ? '...' : 'Ücretsiz'}</Text></View>
            </TouchableOpacity>

            <TouchableOpacity style={s.heartBtnCoin} onPress={handleBuyLifeCoins} activeOpacity={0.85}>
              <View style={s.heartBtnLeft}>
                <View style={s.heartIconBg}><Text style={{ fontSize: 20 }}>❤️</Text></View>
                <View>
                  <Text style={s.heartBtnTitle}>Coin Harca</Text>
                  <Text style={s.heartBtnSub}>+1 kalp kazan</Text>
                </View>
              </View>
              <View style={s.coinBtnBadge}>
                <Text style={{ fontSize: 12 }}>🪙</Text>
                <Text style={s.coinBtnAmt}>100</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* KOİN PAKETLERİ */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>🪙 Coin Paketleri</Text>
        <View style={s.packsList}>
          {COIN_PACKAGES.map(pkg => (
            <CoinPackCard key={pkg.id} pkg={pkg} onPress={() => handleBuyCoin(pkg)} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: Colors.purpleLight, fontSize: 26 },
  headerTitle: { color: Colors.white, fontSize: 18, fontWeight: '900' },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.gold },
  coinTxt: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  content: { paddingHorizontal: 14, paddingTop: 16 },
  sectionTitle: { color: Colors.white, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  heartCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  heartPreviewRow: { flexDirection: 'row', gap: 5 },
  heartStatus: { color: Colors.muted, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  heartRegen: { color: Colors.muted, fontSize: 12, textAlign: 'center' },
  heartPreviewAdd: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.green + '15', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: Colors.green + '33' },
  heartPreviewTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: Colors.muted },
  heartBtnsRow: { gap: 10 },
  heartBtnAd: { backgroundColor: '#0f2d1f', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.green },
  heartBtnCoin: { backgroundColor: '#2a1a0a', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.gold },
  heartBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adIconBg: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center' },
  heartIconBg: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(245,158,11,0.12)', alignItems: 'center', justifyContent: 'center' },
  heartBtnTitle: { color: Colors.white, fontSize: 13, fontWeight: '800', marginBottom: 2 },
  heartBtnSub: { color: Colors.muted, fontSize: 11 },
  freeBadge: { backgroundColor: Colors.green, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  freeBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  coinBtnBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: Colors.gold },
  coinBtnAmt: { color: Colors.gold, fontSize: 13, fontWeight: '900' },
  packsList: { gap: 10 },
  packCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border, position: 'relative', overflow: 'hidden' },
  packCardHL: { borderColor: Colors.gold, borderWidth: 2 },
  popularBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.gold, borderBottomLeftRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  popularTxt: { color: '#000', fontSize: 9, fontWeight: '900' },
  packLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packAmt: { color: Colors.white, fontSize: 17, fontWeight: '900' },
  packBonus: { color: Colors.green, fontSize: 10, fontWeight: '700' },
  packPriceBtn: { backgroundColor: Colors.purple, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 },
  packPrice: { color: Colors.white, fontSize: 13, fontWeight: '900' },
});
