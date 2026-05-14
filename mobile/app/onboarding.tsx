import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated,
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '../src/store/settingsStore';
import { Colors } from '../src/constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🏆',
    title: 'Bil Bakalım\'a Hoş Geldin!',
    subtitle: '1.000\'den fazla soru, 12 kategori.\nHer cevap seni bir adım öteye taşır.',
    color: '#e94560',
    details: ['🏺 Tarih  🌍 Coğrafya  🔬 Bilim', '🎬 Sinema  ⚽ Spor  🇹🇷 Türkiye', '🩺 Tıp  🚗 Ehliyet  📈 Ekonomi'],
  },
  {
    emoji: '⚡',
    title: 'Hız = Puan',
    subtitle: 'Ne kadar hızlı cevap verirsen\no kadar çok puan kazanırsın!',
    color: '#f0c040',
    details: ['⚡ 2 saniyede → 30 puan', '🔥 6 saniyede → 20 puan', '⏱️ 12+ saniyede → 6 puan'],
  },
  {
    emoji: '⚔️',
    title: 'Arkadaşına Meydan Oku',
    subtitle: 'Aynı soruları aynı anda cevapla.\nKim daha hızlı ve doğru?',
    color: '#8e44ad',
    details: ['🔴 Her gece 21:00 Canlı Yarışma', '🏆 Klasik Tur — 10 soru, 3 can', '✂️ Jokerler: 50/50, Geç, +60 saniye'],
  },
  {
    emoji: '💡',
    title: 'Sadece Puan Değil — Bilgi',
    subtitle: 'Her doğru ya da yanlış cevaptan sonra\nkısa bir açıklama görürsün.',
    color: '#1abc9c',
    details: ['📖 Her sorudan bir şey öğren', '🧠 Hafızan güçlendikçe puanın artar', '🇹🇷 Türkiye\'ye özgü içerikler seni şaşırtacak'],
  },
];

export default function OnboardingScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const dotAnims = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  const animateDots = (idx: number) => {
    dotAnims.forEach((anim, i) => {
      Animated.spring(anim, { toValue: i === idx ? 1 : 0, useNativeDriver: false }).start();
    });
  };

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * width, animated: true });
    setSlide(idx);
    animateDots(idx);
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(auth)/register'); // Yeni kullanıcıyı kayıt sayfasına gönder
  };

  const s = styles(C);
  const current = SLIDES[slide];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bgPrimary }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((sl, i) => (
          <View key={i} style={[s.slide, { width }]}>
            <View style={[s.emojiBg, { backgroundColor: sl.color + '20' }]}>
              <Text style={s.emoji}>{sl.emoji}</Text>
            </View>
            <Text style={[s.title, { color: C.textPrimary }]}>{sl.title}</Text>
            <Text style={[s.subtitle, { color: C.textSecondary }]}>{sl.subtitle}</Text>
            <View style={[s.detailCard, { backgroundColor: C.bgSecondary }]}>
              {sl.details.map((d, j) => (
                <Text key={j} style={[s.detail, { color: C.textPrimary }]}>{d}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dot göstergesi */}
      <View style={s.dots}>
        {SLIDES.map((sl, i) => (
          <Animated.View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor: dotAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [C.bgTertiary, sl.color],
                }),
                width: dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [8, 24] }),
              },
            ]}
          />
        ))}
      </View>

      {/* Butonlar */}
      <View style={s.btnRow}>
        {slide > 0 ? (
          <TouchableOpacity style={[s.backBtn, { borderColor: C.border }]} onPress={() => goTo(slide - 1)}>
            <Text style={[s.backBtnText, { color: C.textSecondary }]}>← Geri</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.skipBtn} onPress={finish}>
            <Text style={[s.skipText, { color: C.textSecondary }]}>Atla</Text>
          </TouchableOpacity>
        )}

        {slide < SLIDES.length - 1 ? (
          <TouchableOpacity style={[s.nextBtn, { backgroundColor: current.color }]} onPress={() => goTo(slide + 1)}>
            <Text style={s.nextBtnText}>İleri →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.nextBtn, { backgroundColor: current.color }]} onPress={finish}>
            <Text style={s.nextBtnText}>Başlayalım! 🚀</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  emojiBg: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emoji: { fontSize: 72 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 26, textAlign: 'center' },
  subtitle: { fontFamily: 'Nunito-Regular', fontSize: 15, textAlign: 'center', lineHeight: 24 },
  detailCard: { width: '100%', borderRadius: 18, padding: 20, gap: 10 },
  detail: { fontFamily: 'Nunito-Bold', fontSize: 14, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 20 },
  dot: { height: 8, borderRadius: 4 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  backBtn: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5 },
  backBtnText: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  skipBtn: { flex: 1, padding: 16, alignItems: 'center' },
  skipText: { fontFamily: 'Nunito-Regular', fontSize: 14 },
  nextBtn: { flex: 2, borderRadius: 16, padding: 18, alignItems: 'center' },
  nextBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#fff' },
});
