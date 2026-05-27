/**
 * Mağaza — store + API bağlantılı
 * app/shop.tsx
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../src/store/userStore';
import api from '../src/services/api';
import { Colors } from '../src/constants/theme';
import { iapService, PRODUCT_IDS } from '../src/services/iap.service';

const JOKER_ITEMS = [
  { type: 'fifty'  as const, icon: '✂️', label: '50:50',    desc: '2 yanlış şıkkı kaldır', price: 50,  color: '#ef4444', bg: '#fee2e2' },
  { type: 'change' as const, icon: '🔀', label: 'Değiştir', desc: 'Soruyu değiştir',         price: 70,  color: '#6c3aed', bg: '#ede9fe' },
  { type: 'pass'   as const, icon: '✕',  label: 'Pas',      desc: 'Soruyu geç',              price: 50,  color: '#6b7280', bg: '#f3f4f6' },
];

const AVATARS_SHOP = [
  { id: 4,  emoji: '🦁', name: 'Aslan',   price: 100  },
  { id: 5,  emoji: '🐯', name: 'Kaplan',  price: 100  },
  { id: 6,  emoji: '🦝', name: 'Rakun',   price: 250  },
  { id: 7,  emoji: '🐨', name: 'Koala',   price: 250  },
  { id: 8,  emoji: '🦄', name: 'Unicorn', price: 500  },
  { id: 9,  emoji: '🐲', name: 'Ejderha', price: 500  },
  { id: 10, emoji: '🦅', name: 'Kartal',  price: 1000 },
];

const { width: W } = Dimensions.get('window');

const COIN_PACKAGES = [
  { id: PRODUCT_IDS.coins_500,  amount: 500,  price: '₺19,99' },
  { id: PRODUCT_IDS.coins_1200, amount: 1200, price: '₺39,99', bonus: '200', highlight: true },
  { id: PRODUCT_IDS.coins_2500, amount: 2500, price: '₺79,99', bonus: '500' },
  { id: PRODUCT_IDS.coins_5500, amount: 5500, price: '₺159,99', bonus: '1500' },
];

const CoinPackCard: React.FC<{ pkg: typeof COIN_PACKAGES[0]; onPress: () => void; loading?: boolean }> = ({ pkg, onPress, loading }) => {
  const sc = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale: sc }] }}>
      <TouchableOpacity
        style={[s.packCard, pkg.highlight && s.packCardHL, loading && { opacity: 0.7 }]}
        onPress={() => {
          if (loading) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.sequence([
            Animated.timing(sc, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.spring(sc, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
          ]).start();
          onPress();
        }}
        activeOpacity={1}
        disabled={loading}
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
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={[s.packPrice, pkg.highlight && { color: '#000' }]}>{pkg.price}</Text>
          }
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ShopScreen() {
  const { user, addCoins, addJoker, jokers, updateUser } = useUserStore();
  const [hearts,      setHearts]      = useState(5);
  const [maxHearts,   setMaxHearts]   = useState(5);
  const [nextHeart,   setNextHeart]   = useState<number | null>(null);
  const [adLoading,   setAdLoading]   = useState(false);
  const [buyingPkg,   setBuyingPkg]   = useState<string | null>(null);

  useEffect(() => {
    api.get('/lig/current').then(r => {
      setHearts(r.data?.hearts ?? 5);
      setMaxHearts(r.data?.maxHearts ?? 5);
      setNextHeart(r.data?.nextHeartMinutes ?? null);
    }).catch(() => {});
    // IAP bağlantısını başlat
    iapService.init().catch(() => {});
    return () => { iapService.destroy(); };
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

  const handleBuyStreakFreeze = async () => {
    if ((user?.coins ?? 0) < 100) { Alert.alert('Yetersiz Altın', 'Seri dondurma için 100 🪙 gerekli.'); return; }
    Alert.alert(
      '🧊 Seri Dondurma',
      '100 🪙 karşılığında bugünkü seriniz korunur. Bugün oynamasanız bile seri sıfırlanmaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Satın Al', onPress: async () => {
          try {
            const res = await api.post('/user/buy-streak-freeze');
            updateUser({ coins: res.data.coins });
            Alert.alert('✅ Donduruldu!', 'Bugünkü seriniz koruma altında. 🧊');
          } catch (e: any) {
            Alert.alert('Hata', e?.response?.data?.message ?? 'İşlem başarısız.');
          }
        }},
      ]
    );
  };

  const handleRefillAllHearts = async () => {
    if (hearts >= maxHearts) { Alert.alert('Dolu!', 'Kalplerin zaten dolu.'); return; }
    if ((user?.coins ?? 0) < 250) { Alert.alert('Yetersiz Altın', '5 kalbi doldurmak için 250 🪙 gerekli.'); return; }
    try {
      const res = await api.post('/lig/refill-hearts');
      setHearts(res.data.hearts);
      updateUser({ coins: res.data.coins });
      Alert.alert('✅ Kalplerin Doldu!', '5 kalbin yenilendi. 250 🪙 harcandı.');
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message ?? 'İşlem başarısız.');
    }
  };

  const handleBuyJoker = (item: typeof JOKER_ITEMS[0]) => {
    if ((user?.coins ?? 0) < item.price) {
      Alert.alert('Yetersiz Coin', `${item.label} için ${item.price} 🪙 gerekiyor.`);
      return;
    }
    Alert.alert(
      `${item.icon} ${item.label} Satın Al`,
      `${item.price} 🪙 karşılığında 1 adet ${item.label} joker alınacak.\n\nMevcut: ${jokers[item.type] ?? 0} adet`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Satın Al', onPress: () => {
            addCoins(-item.price);
            addJoker(item.type, 1);
            Alert.alert('✅ Eklendi!', `+1 ${item.label} joker cüzdanına eklendi.`);
          },
        },
      ]
    );
  };

  const handleBuyAvatar = (av: typeof AVATARS_SHOP[0]) => {
    if (user?.unlockedAvatars?.includes(av.id)) {
      // Zaten sahip → seç
      updateUser({ avatarId: av.id });
      Alert.alert('✅', `${av.emoji} ${av.name} avatarı seçildi!`);
      return;
    }
    if ((user?.coins ?? 0) < av.price) {
      Alert.alert('Yetersiz Coin', `${av.name} için ${av.price} 🪙 gerekiyor.`);
      return;
    }
    Alert.alert(
      `${av.emoji} ${av.name}`,
      `${av.price} 🪙 karşılığında bu avatarı satın almak istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Satın Al', onPress: () => {
            addCoins(-av.price);
            const newUnlocked = [...(user?.unlockedAvatars ?? []), av.id];
            updateUser({ avatarId: av.id, unlockedAvatars: newUnlocked });
            Alert.alert('🎉', `${av.emoji} ${av.name} avatarı açıldı!`);
          },
        },
      ]
    );
  };

  const handleBuyCoin = async (pkg: typeof COIN_PACKAGES[0]) => {
    if (buyingPkg) return;
    setBuyingPkg(pkg.id);
    try {
      const result = await iapService.purchaseProduct(
        pkg.id as any,
        (_receipt, _productId) => {
          // onSuccess — purchaseProduct içinde zaten handle ediliyor
        },
        (err) => {
          if (err.code !== 'E_USER_CANCELLED') {
            Alert.alert('Satın Alma Hatası', err.message ?? 'İşlem başarısız.');
          }
        },
      );
      // purchaseProduct void döndürüyor; listener'da işlem tamamlanınca coin güncelle
      // Kullanıcı profilini yenile
      const { default: apiClient } = await import('../src/services/api');
      const res = await apiClient.get('/user/profile').catch(() => null);
      if (res?.data?.user?.coins !== undefined) {
        updateUser({ coins: res.data.user.coins });
        Alert.alert('✅ Satın Alındı!', `${pkg.amount} 🪙 hesabına eklendi.`);
      }
    } catch {
      Alert.alert('Hata', 'Satın alma tamamlanamadı.');
    } finally {
      setBuyingPkg(null);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🏪 Mağaza</Text>
        <View style={s.coinBadge}>
          <Text style={{ fontSize: 14 }}>🪙</Text>
          <Text style={s.coinTxt}>{(user?.coins ?? 0).toLocaleString('tr-TR')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* VIP BANNER */}
        <TouchableOpacity onPress={() => router.push('/vip' as any)} activeOpacity={0.88} style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
          <LinearGradient
            colors={['#1a0533', '#4c1d95', '#6d28d9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.vipBanner}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.vipBadge}>👑 VIP ÜYELİK</Text>
              <Text style={s.vipTitle}>Tüm ayrıcalıkları aç</Text>
              <Text style={s.vipSub}>Sonsuz kalp · Reklamsız · 1.5x XP</Text>
            </View>
            <View style={s.vipPriceBox}>
              <Text style={s.vipPrice}>₺29,99</Text>
              <Text style={s.vipPriceSub}>/ay</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

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

            <TouchableOpacity style={s.heartBtnFull} onPress={handleRefillAllHearts} activeOpacity={0.85}>
              <View style={s.heartBtnLeft}>
                <View style={s.fullIconBg}><Text style={{ fontSize: 20 }}>❤️‍🔥</Text></View>
                <View>
                  <Text style={s.heartBtnTitle}>5 Kalbi Doldur</Text>
                  <Text style={s.heartBtnSub}>Anında tüm kalpler yenilenir</Text>
                </View>
              </View>
              <View style={[s.coinBtnBadge, { borderColor: '#fca5a5', backgroundColor: '#fee2e2' }]}>
                <Text style={{ fontSize: 12 }}>🪙</Text>
                <Text style={[s.coinBtnAmt, { color: '#dc2626' }]}>250</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* SERİ DONDURMA */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>🧊 Seri Dondurma</Text>
        <Text style={s.sectionSub}>Bugün oynamasan bile serinizi korur</Text>
        <TouchableOpacity style={s.freezeCard} onPress={handleBuyStreakFreeze} activeOpacity={0.85}>
          <View style={s.freezeLeft}>
            <View style={s.freezeIconWrap}>
              <Text style={{ fontSize: 28 }}>🧊</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.freezeTitle}>Seri Dondurma</Text>
              <Text style={s.freezeSub}>Bugün için geçerli · 1 günlük koruma</Text>
              <View style={s.freezeTagRow}>
                <View style={s.freezeTag}><Text style={s.freezeTagTxt}>🔥 Serinizi kaybetmeyin!</Text></View>
              </View>
            </View>
          </View>
          <View style={s.freezePriceBox}>
            <Text style={{ fontSize: 14 }}>🪙</Text>
            <Text style={s.freezePrice}>100</Text>
          </View>
        </TouchableOpacity>

        {/* JOKERLER */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>🃏 Jokerler</Text>
        <Text style={s.sectionSub}>Oyun içinde kullanmak için joker satın al</Text>
        <View style={s.jokerList}>
          {JOKER_ITEMS.map(item => (
            <TouchableOpacity key={item.type} style={s.jokerCard} onPress={() => handleBuyJoker(item)} activeOpacity={0.85}>
              <View style={[s.jokerIconWrap, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.jokerLabel}>{item.label}</Text>
                <Text style={s.jokerDesc}>{item.desc}</Text>
              </View>
              <View style={s.jokerRight}>
                <View style={[s.jokerCount, { borderColor: item.color + '44' }]}>
                  <Text style={[s.jokerCountTxt, { color: item.color }]}>{jokers[item.type] ?? 0} adet</Text>
                </View>
                <View style={[s.jokerPriceBtn, { backgroundColor: item.color }]}>
                  <Text style={s.jokerPriceTxt}>{item.price} 🪙</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* AVATARLAR */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>🎭 Avatarlar</Text>
        <Text style={s.sectionSub}>Coin ile yeni avatarlar aç</Text>
        <View style={s.avatarGrid}>
          {AVATARS_SHOP.map(av => {
            const owned = user?.unlockedAvatars?.includes(av.id);
            const active = user?.avatarId === av.id;
            return (
              <TouchableOpacity key={av.id} style={[s.avatarCard, active && s.avatarCardActive]} onPress={() => handleBuyAvatar(av)} activeOpacity={0.85}>
                <Text style={{ fontSize: 34 }}>{av.emoji}</Text>
                <Text style={s.avatarName}>{av.name}</Text>
                {owned
                  ? <View style={s.avatarOwned}><Text style={s.avatarOwnedTxt}>{active ? '✓ Aktif' : 'Seç'}</Text></View>
                  : <View style={s.avatarPrice}><Text style={s.avatarPriceTxt}>{av.price} 🪙</Text></View>
                }
              </TouchableOpacity>
            );
          })}
        </View>

        {/* KOİN PAKETLERİ */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>🪙 Coin Paketleri</Text>
        <View style={s.packsList}>
          {COIN_PACKAGES.map(pkg => (
            <CoinPackCard key={pkg.id} pkg={pkg} loading={buyingPkg === pkg.id} onPress={() => handleBuyCoin(pkg)} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fff' },
  backBtn: { },
  backTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  headerTitle: { color: '#111827', fontSize: 18, fontWeight: '900' },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fef9c3', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#fde68a' },
  coinTxt: { color: '#d97706', fontSize: 12, fontWeight: '800' },
  content: { paddingHorizontal: 14, paddingTop: 16, backgroundColor: '#fff' },
  sectionTitle: { color: '#111827', fontSize: 16, fontWeight: '900', marginBottom: 12 },

  // VIP banner
  vipBanner:   { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
  vipBadge:    { fontFamily: 'Nunito-ExtraBold', fontSize: 9, color: '#f59e0b', letterSpacing: 1, marginBottom: 4 },
  vipTitle:    { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#fff', marginBottom: 3 },
  vipSub:      { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#c4b5fd' },
  vipPriceBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  vipPrice:    { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#f59e0b' },
  vipPriceSub: { fontFamily: 'Nunito-Regular', fontSize: 10, color: '#c4b5fd' },

  // Kalp kartı
  heartCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  heartPreviewRow: { flexDirection: 'row', gap: 5 },
  heartStatus: { color: '#6b7280', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  heartRegen: { color: '#9ca3af', fontSize: 12, textAlign: 'center' },
  heartPreviewAdd: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#bbf7d0', gap: 4 },
  heartPreviewTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#6b7280' },
  heartBtnsRow: { gap: 10 },

  // Reklam butonu
  heartBtnAd: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#86efac' },
  // Coin butonu
  heartBtnCoin: { backgroundColor: '#fffbeb', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#fde68a' },

  heartBtnFull: { backgroundColor: '#fff1f2', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#fecdd3' },
  heartBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adIconBg:    { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  heartIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  fullIconBg:  { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  heartBtnTitle: { color: '#111827', fontSize: 13, fontWeight: '800', marginBottom: 2 },
  heartBtnSub: { color: '#9ca3af', fontSize: 11 },
  freeBadge: { backgroundColor: '#22c55e', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  freeBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  coinBtnBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#fde68a' },
  coinBtnAmt: { color: '#d97706', fontSize: 13, fontWeight: '900' },

  sectionSub: { color: '#9ca3af', fontSize: 12, marginTop: -8, marginBottom: 12 },

  // Seri dondurma
  freezeCard:     { backgroundColor: '#eff6ff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#bfdbfe', marginBottom: 4 },
  freezeLeft:     { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  freezeIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  freezeTitle:    { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#1e3a5f', marginBottom: 2 },
  freezeSub:      { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#6b7280', marginBottom: 6 },
  freezeTagRow:   { flexDirection: 'row' },
  freezeTag:      { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#fde68a' },
  freezeTagTxt:   { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#d97706' },
  freezePriceBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#dbeafe', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#93c5fd' },
  freezePrice:    { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#1d4ed8' },

  // Jokerler
  jokerList: { gap: 10, marginBottom: 4 },
  jokerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  jokerIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  jokerLabel: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#111827', marginBottom: 2 },
  jokerDesc:  { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#9ca3af' },
  jokerRight: { alignItems: 'flex-end', gap: 6 },
  jokerCount: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  jokerCountTxt: { fontFamily: 'Nunito-Bold', fontSize: 11 },
  jokerPriceBtn: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  jokerPriceTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#fff' },

  // Avatarlar
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  avatarCard: { width: '30%', backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  avatarCardActive: { borderColor: '#8b5cf6', backgroundColor: '#faf5ff' },
  avatarName: { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#374151', textAlign: 'center' },
  avatarOwned: { backgroundColor: '#d1fae5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  avatarOwnedTxt: { fontFamily: 'Nunito-Bold', fontSize: 10, color: '#059669' },
  avatarPrice: { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#fde68a' },
  avatarPriceTxt: { fontFamily: 'Nunito-Bold', fontSize: 10, color: '#d97706' },

  // Coin paketleri
  packsList: { gap: 10 },
  packCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f3f4f6', position: 'relative', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  packCardHL: { borderColor: '#f59e0b', borderWidth: 2, backgroundColor: '#fffbeb' },
  popularBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#f59e0b', borderBottomLeftRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  popularTxt: { color: '#000', fontSize: 9, fontWeight: '900' },
  packLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packAmt: { color: '#111827', fontSize: 17, fontWeight: '900' },
  packBonus: { color: '#22c55e', fontSize: 10, fontWeight: '700' },
  packPriceBtn: { backgroundColor: '#6c3aed', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  packPrice: { color: '#fff', fontSize: 13, fontWeight: '900' },
});
