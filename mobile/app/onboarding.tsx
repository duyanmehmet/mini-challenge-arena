import { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SLIDES = [
  {
    id: '1',
    emoji: '🏆',
    emojiSize: 120,
    bg: '#0f0a20',
    accent: '#6c3aed',
    title: 'Zeka Meydanı',
    titleColor: '#ffd600',
    subtitle: 'Türkiye\'nin en heyecanlı\nbilgi yarışması!',
    desc: '3.000\'den fazla soru, onlarca kategori\nve gerçek rakipler seni bekliyor.',
    decorations: ['❓', '💡', '⭐', '🎯'],
  },
  {
    id: '2',
    emoji: '🏟️',
    emojiSize: 100,
    bg: '#0a0520',
    accent: '#8b5cf6',
    title: 'Haftalık Lig',
    titleColor: '#f59e0b',
    subtitle: '30 farklı ligde\nyüksel ve kazan!',
    desc: 'Her hafta yeni kategori, yeni rakipler.\nFiliz\'den Şampiyon\'a kadar tırman.',
    decorations: ['🥉', '🥈', '🥇', '👑'],
  },
  {
    id: '3',
    emoji: '⚔️',
    emojiSize: 100,
    bg: '#0d0015',
    accent: '#ef4444',
    title: 'Çark Düello',
    titleColor: '#ef4444',
    subtitle: 'Çark dönsün,\nrakibini yen!',
    desc: 'Coin bahis et, çark kategoriyi belirlesin.\n3 tur kazan, altınları topla.',
    decorations: ['🎡', '🪙', '🔥', '💎'],
  },
  {
    id: '4',
    emoji: '🚀',
    emojiSize: 110,
    bg: '#0a1020',
    accent: '#22c55e',
    title: 'Hazır mısın?',
    titleColor: '#22c55e',
    subtitle: 'Bilgini yarıştır,\nzirveye ulaş!',
    desc: 'Günlük görevler, özel ödüller\nve arkadaşlarınla rekabet seni bekliyor.',
    decorations: ['🎮', '💬', '🏅', '✨'],
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim= useRef(new Animated.Value(1)).current;

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -18, duration: 1800, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0,   duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  const goTo = (idx: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();

    setCurrent(idx);
  };

  const next = () => {
    if (current < SLIDES.length - 1) goTo(current + 1);
    else finish();
  };

  const skip = async () => finish();

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(auth)/register');
  };

  const goLogin = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(auth)/login');
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <View style={[s.root, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={slide.bg} />

      {/* Dekoratif yıldızlar */}
      {[
        { top: '8%', left: '8%' },
        { top: '12%', right: '10%' },
        { top: '35%', left: '85%' },
        { top: '55%', left: '5%' },
        { top: '70%', right: '8%' },
      ].map((pos, i) => (
        <Text key={i} style={[s.star, pos as any, { opacity: 0.15 + i * 0.05 }]}>✦</Text>
      ))}

      {/* Dekorasyon emojileri köşelerde */}
      <Text style={[s.deco, { top: '15%', left: '5%', transform: [{ rotate: '-20deg' }] }]}>
        {slide.decorations[0]}
      </Text>
      <Text style={[s.deco, { top: '18%', right: '6%', transform: [{ rotate: '15deg' }] }]}>
        {slide.decorations[1]}
      </Text>
      <Text style={[s.deco, { top: '48%', left: '3%', transform: [{ rotate: '10deg' }] }]}>
        {slide.decorations[2]}
      </Text>
      <Text style={[s.deco, { top: '52%', right: '4%', transform: [{ rotate: '-12deg' }] }]}>
        {slide.decorations[3]}
      </Text>

      <SafeAreaView style={s.safe}>

        {/* Skip */}
        {!isLast && (
          <TouchableOpacity style={s.skipBtn} onPress={skip}>
            <Text style={s.skipTxt}>Geç</Text>
          </TouchableOpacity>
        )}

        {/* Ana içerik */}
        <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

          {/* Emoji */}
          <Animated.View style={[s.emojiWrap, {
            shadowColor: slide.accent,
            transform: [{ translateY: floatAnim }],
          }]}>
            <View style={[s.emojiGlow, { backgroundColor: slide.accent + '25', shadowColor: slide.accent }]}>
              <Text style={{ fontSize: slide.emojiSize }}>{slide.emoji}</Text>
            </View>
          </Animated.View>

          {/* Başlık */}
          <Text style={[s.title, { color: slide.titleColor }]}>{slide.title}</Text>
          <Text style={s.subtitle}>{slide.subtitle}</Text>
          <Text style={s.desc}>{slide.desc}</Text>

        </Animated.View>

        {/* Alt alan */}
        <View style={s.bottom}>

          {/* Nokta göstergesi */}
          <View style={s.dots}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)}>
                <Animated.View style={[
                  s.dot,
                  i === current
                    ? [s.dotActive, { backgroundColor: slide.accent, width: 24 }]
                    : s.dotInactive,
                ]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* İleri / Başla butonu */}
          <TouchableOpacity
            style={[s.btn, { backgroundColor: slide.accent }]}
            onPress={next}
            activeOpacity={0.85}
          >
            <Text style={s.btnTxt}>
              {isLast ? 'Başlayalım 🚀' : 'İleri →'}
            </Text>
          </TouchableOpacity>

          {/* Giriş yap */}
          <TouchableOpacity style={s.loginBtn} onPress={goLogin}>
            <Text style={s.loginTxt}>
              Zaten hesabın var mı?{'  '}
              <Text style={s.loginBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },

  star: { position: 'absolute', color: '#fff', fontSize: 18 },
  deco: { position: 'absolute', fontSize: 34, opacity: 0.18 },

  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 8, marginTop: 4 },
  skipTxt: { fontFamily: 'Nunito-SemiBold', fontSize: 15, color: '#7c7aaa' },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },

  emojiWrap: { marginBottom: 24 },
  emojiGlow: {
    borderRadius: 60, padding: 24,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 40,
    elevation: 20,
    alignItems: 'center', justifyContent: 'center',
  },

  title:    { fontFamily: 'Nunito-ExtraBold', fontSize: 40, textAlign: 'center', marginBottom: 10,
              textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 10 },
  subtitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#ffffff', textAlign: 'center', marginBottom: 16, lineHeight: 30 },
  desc:     { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#9ca3af', textAlign: 'center', lineHeight: 24 },

  bottom: { width: '100%', paddingHorizontal: 24, gap: 16, paddingBottom: 8 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot:  { height: 8, borderRadius: 4 },
  dotActive:   { width: 24 },
  dotInactive: { width: 8, backgroundColor: '#2e2b5a' },

  btn: {
    width: '100%', paddingVertical: 20, borderRadius: 100,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 12,
  },
  btnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#fff', letterSpacing: 0.5 },

  loginBtn: { alignItems: 'center', paddingVertical: 4 },
  loginTxt: { fontFamily: 'Nunito-SemiBold', fontSize: 15, color: '#7c7aaa' },
  loginBold:{ fontFamily: 'Nunito-Bold', color: '#fff' },
});
