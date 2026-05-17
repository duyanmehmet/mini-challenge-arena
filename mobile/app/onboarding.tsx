import { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';

const SLIDES = [
  {
    icon:     '🏆',
    glow:     '#f59e0b',
    title:    'Bilgini Test Et',
    subtitle: 'Yüzlerce soru ile kendini geliştir.',
  },
  {
    icon:     '⚔️',
    glow:     '#8b5cf6',
    title:    'Düello Modu',
    subtitle: 'Arkadaşlarınla yarış, zirveye çık.',
  },
  {
    icon:     '📋',
    glow:     '#3b82f6',
    title:    'Görevleri Tamamla',
    subtitle: 'Her gün görevlerini yap, ödüller kazan.',
  },
  {
    icon:     '📊',
    glow:     '#10b981',
    title:    'İstatistiklerini Gör',
    subtitle: 'Performansını takip et, gelişimini izle.',
  },
];

export default function OnboardingScreen() {
  const flatRef   = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const currentIdx = useRef(0);

  const goTo = (idx: number) => {
    flatRef.current?.scrollToIndex({ index: idx, animated: true });
    Animated.timing(slideAnim, {
      toValue: idx, duration: 300, useNativeDriver: false,
    }).start();
    currentIdx.current = idx;
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    const next = currentIdx.current + 1;
    if (next < SLIDES.length) goTo(next);
    else finish();
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Slaytlar */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={s.slide}>
            {/* İkon */}
            <View style={[s.iconRing, { shadowColor: item.glow }]}>
              <View style={[s.iconInner, { backgroundColor: item.glow + '22', borderColor: item.glow + '55' }]}>
                <Text style={s.iconEmoji}>{item.icon}</Text>
              </View>
            </View>

            {/* Başlık */}
            <Text style={s.title}>{item.title}</Text>

            {/* Subtitle */}
            <Text style={s.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dot göstergesi */}
      <View style={s.dotsRow}>
        {SLIDES.map((_, i) => {
          const dotWidth = slideAnim.interpolate({
            inputRange: SLIDES.map((__, j) => j),
            outputRange: SLIDES.map((__, j) => (j === i ? 24 : 8)),
            extrapolate: 'clamp',
          });
          const dotColor = slideAnim.interpolate({
            inputRange: SLIDES.map((__, j) => j),
            outputRange: SLIDES.map((__, j) => (j === i ? '#fff' : '#3d2d7a')),
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[s.dot, { width: dotWidth, backgroundColor: dotColor }]}
            />
          );
        })}
      </View>

      {/* İleri Butonu */}
      <View style={s.btnArea}>
        <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={s.btnText}>İleri</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },

  // İkon halkası
  iconRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 20,
    marginBottom: 12,
  },
  iconInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  iconEmoji: {
    fontSize: 90,
  },

  title: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#a78bfa',
    textAlign: 'center',
    lineHeight: 26,
  },

  // Dot'lar
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Buton alanı
  btnArea: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  btn: {
    backgroundColor: PURP,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: PURP2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  btnText: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 18,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
