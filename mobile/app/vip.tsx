import { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUserStore } from '../src/store/userStore';

const { width } = Dimensions.get('window');

const PERKS = [
  { icon: '❤️',  title: 'Sonsuz Kalp',        desc: 'Lig\'de hiç kalp bitmesin' },
  { icon: '⭐',  title: '1.5x XP Bonusu',      desc: 'Her oyunda daha hızlı seviyelan' },
  { icon: '🪙',  title: 'Günlük 100 Coin',      desc: 'Her gün otomatik hesabına eklenir' },
  { icon: '🚫',  title: 'Reklamsız',            desc: 'Hiç reklam görmeden oyna' },
  { icon: '🎭',  title: 'VIP Çerçeve',          desc: 'Profilinde özel altın çerçeve' },
  { icon: '⚡',  title: 'Öncelikli Eşleşme',   desc: 'Düelloda daha hızlı rakip bul' },
];

export default function VipScreen() {
  const { user } = useUserStore();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim  = useRef(new Animated.Value(0.6)).current;
  const crownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(crownAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1,   duration: 1800, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  const handleSubscribe = () => {
    Alert.alert(
      '👑 VIP Üyelik',
      'Uygulama içi satın alma yakında aktif olacak. Çok yakında burada olacak!',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Hero gradient */}
        <LinearGradient
          colors={['#1a0533', '#2d1060', '#4c1d95', '#6d28d9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {/* Geri butonu */}
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backTxt}>← Geri</Text>
          </TouchableOpacity>

          {/* Dekor yıldızlar */}
          {[
            { t: 30,  l: 20,  s: 10 }, { t: 60,  l: 60,  s: 6  },
            { t: 20,  r: 30,  s: 8  }, { t: 80,  r: 20,  s: 12 },
            { t: 110, l: 40,  s: 7  }, { t: 140, r: 50,  s: 9  },
          ].map((p, i) => (
            <Animated.Text key={i} style={[s.starDeco, {
              top: p.t, left: (p as any).l, right: (p as any).r,
              fontSize: p.s, opacity: glowAnim,
            }]}>✦</Animated.Text>
          ))}

          {/* Taç */}
          <Animated.Text style={[s.crown, { transform: [{ scale: crownAnim }] }]}>
            👑
          </Animated.Text>

          <Text style={s.heroTitle}>VIP Üyelik</Text>
          <Text style={s.heroSub}>Tüm ayrıcalıkların kilidini aç</Text>

          {/* Fiyat kartı */}
          <Animated.View style={[s.priceCard, { opacity: fadeAnim }]}>
            <View style={s.priceLeft}>
              <Text style={s.priceLabel}>AYLIK</Text>
              <View style={s.priceRow}>
                <Text style={s.priceCurrency}>₺</Text>
                <Text style={s.priceAmount}>29</Text>
                <Text style={s.priceCents}>.99</Text>
              </View>
              <Text style={s.priceSub}>İstediğin zaman iptal et</Text>
            </View>
            <View style={s.priceDivider} />
            <View style={s.priceRight}>
              <Text style={s.savingTitle}>Günlük</Text>
              <Text style={s.savingAmount}>~₺1</Text>
              <Text style={s.savingDesc}>Bir kahvenin{'\n'}fiyatından az</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Avantajlar */}
        <View style={s.perksSection}>
          <Text style={s.perksTitle}>VIP Ayrıcalıkları</Text>

          <View style={s.perksList}>
            {PERKS.map((perk, i) => (
              <Animated.View
                key={i}
                style={[s.perkCard, {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }]}
              >
                <View style={s.perkIconWrap}>
                  <Text style={{ fontSize: 26 }}>{perk.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.perkTitle}>{perk.title}</Text>
                  <Text style={s.perkDesc}>{perk.desc}</Text>
                </View>
                <View style={s.checkWrap}>
                  <Text style={s.checkTxt}>✓</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Karşılaştırma */}
        <View style={s.compareSection}>
          <Text style={s.compareTitle}>Ücretsiz vs VIP</Text>
          <View style={s.compareCard}>
            <View style={s.compareHeader}>
              <Text style={s.compareColHead} />
              <Text style={[s.compareColHead, { color: '#6b7280' }]}>Ücretsiz</Text>
              <Text style={[s.compareColHead, { color: '#f59e0b' }]}>👑 VIP</Text>
            </View>
            {[
              { label: 'Kalp',       free: '5 kalp',    vip: 'Sonsuz ❤️' },
              { label: 'Günlük Coin',free: '25 🪙',      vip: '125 🪙' },
              { label: 'XP Bonusu',  free: '1x',        vip: '1.5x ⭐' },
              { label: 'Reklamlar',  free: 'Var',        vip: 'Yok 🚫' },
              { label: 'Çerçeve',    free: 'Standart',   vip: 'Altın 🎭' },
            ].map((row, i) => (
              <View key={i} style={[s.compareRow, i % 2 === 0 && s.compareRowAlt]}>
                <Text style={s.compareLabel}>{row.label}</Text>
                <Text style={s.compareFree}>{row.free}</Text>
                <Text style={s.compareVip}>{row.vip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={s.ctaSection}>
          <TouchableOpacity onPress={handleSubscribe} activeOpacity={0.88} style={s.ctaWrap}>
            <LinearGradient
              colors={['#f59e0b', '#d97706', '#b45309']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.ctaBtn}
            >
              <Text style={s.ctaIcon}>👑</Text>
              <View>
                <Text style={s.ctaTxt}>VIP Üye Ol</Text>
                <Text style={s.ctaSub}>₺29,99 / ay · İstediğin zaman iptal</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={s.ctaDisclaimer}>
            Abonelik Google Play / App Store üzerinden yönetilir.{'\n'}
            İlk ay deneme süresi ileride eklenebilir.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  // Hero
  hero:    { paddingBottom: 32, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  backTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  starDeco:{ position: 'absolute', color: '#f59e0b' },

  crown:     { fontSize: 72, marginTop: 56, marginBottom: 8 },
  heroTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: '#fff', marginBottom: 4 },
  heroSub:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#c4b5fd', marginBottom: 24 },

  // Fiyat kartı
  priceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20, marginHorizontal: 20,
    padding: 20, gap: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  priceLeft:     { flex: 1, gap: 2 },
  priceLabel:    { fontFamily: 'Nunito-Bold', fontSize: 10, color: '#c4b5fd', letterSpacing: 1 },
  priceRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 2 },
  priceCurrency: { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: '#fff', marginTop: 6 },
  priceAmount:   { fontFamily: 'Nunito-ExtraBold', fontSize: 52, color: '#fff', lineHeight: 58 },
  priceCents:    { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: '#fff', marginTop: 6 },
  priceSub:      { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#a78bfa' },
  priceDivider:  { width: 1, height: 70, backgroundColor: 'rgba(255,255,255,0.2)' },
  priceRight:    { flex: 1, alignItems: 'center', gap: 4 },
  savingTitle:   { fontFamily: 'Nunito-Bold', fontSize: 11, color: '#c4b5fd' },
  savingAmount:  { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: '#f59e0b' },
  savingDesc:    { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#a78bfa', textAlign: 'center', lineHeight: 16 },

  // Avantajlar
  perksSection: { paddingHorizontal: 16, paddingTop: 28, paddingBottom: 8 },
  perksTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827', marginBottom: 14 },
  perksList:    { gap: 10 },
  perkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#faf5ff', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#e9d5ff',
  },
  perkIconWrap: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  perkTitle:    { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#111827', marginBottom: 2 },
  perkDesc:     { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#6b7280' },
  checkWrap:    { width: 26, height: 26, borderRadius: 13, backgroundColor: '#6c3aed', alignItems: 'center', justifyContent: 'center' },
  checkTxt:     { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: '#fff' },

  // Karşılaştırma
  compareSection: { paddingHorizontal: 16, paddingBottom: 8 },
  compareTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827', marginBottom: 14 },
  compareCard:    { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' },
  compareHeader:  { flexDirection: 'row', backgroundColor: '#f9fafb', paddingHorizontal: 14, paddingVertical: 10 },
  compareColHead: { flex: 1, fontFamily: 'Nunito-ExtraBold', fontSize: 12, textAlign: 'center' },
  compareRow:     { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  compareRowAlt:  { backgroundColor: '#faf5ff' },
  compareLabel:   { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 13, color: '#374151' },
  compareFree:    { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 12, color: '#6b7280', textAlign: 'center' },
  compareVip:     { flex: 1, fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#7c3aed', textAlign: 'center' },

  // CTA
  ctaSection:     { paddingHorizontal: 16, paddingTop: 8 },
  ctaWrap:        { borderRadius: 20, overflow: 'hidden', shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
  ctaBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  ctaIcon:        { fontSize: 28 },
  ctaTxt:         { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#fff' },
  ctaSub:         { fontFamily: 'Nunito-Regular', fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  ctaDisclaimer:  { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 14, lineHeight: 18 },
});
