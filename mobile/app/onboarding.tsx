import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettingsStore } from '../src/store/settingsStore';
import { Colors } from '../src/constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '⚡',
    title: 'Mini Challenge Arena',
    desc: "10-30 saniyelik şiddetli mini challengelar! Refleks, hafıza, kelime ve daha fazlası seni bekliyor.",
    bg: '#e94560',
  },
  {
    icon: '🏆',
    title: 'Arkadaşlarınla Yarış',
    desc: 'Haftalık ligde yüksel, arkadaşlarınla düello yap, liderlik tablosunda zirvede ol!',
    bg: '#f0c040',
  },
  {
    icon: '🎁',
    title: 'Kazan ve Yüksel',
    desc: 'Günlük görevler tamamla, coin kazan, rozetler topla. Her oturum seni daha güçlü yapar!',
    bg: '#4ecdc4',
  },
];

export default function OnboardingScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(idx);
  };

  const next = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(auth)/register' as any);
  };


  const s = styles(C);
  const isLast = current === SLIDES.length - 1;

  return (
    <View style={[s.container, { backgroundColor: C.bgPrimary }]}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[s.slide, { width }]}>
            <View style={[s.iconBg, { backgroundColor: item.bg + '33' }]}>
              <Text style={s.icon}>{item.icon}</Text>
            </View>
            <Text style={[s.title, { color: C.textPrimary }]}>{item.title}</Text>
            <Text style={[s.desc, { color: C.textSecondary }]}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, { backgroundColor: i === current ? C.accentRed : C.bgTertiary, width: i === current ? 20 : 8 }]} />
        ))}
      </View>

      {/* Butonlar */}
      <View style={s.footer}>
        <TouchableOpacity onPress={finish}>
          <Text style={[s.skip, { color: C.textSecondary }]}>Atla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: C.accentRed }]} onPress={isLast ? finish : next}>
          <Text style={s.btnText}>{isLast ? 'Başla 🚀' : 'İleri →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconBg: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  icon: { fontSize: 72 },
  title: { fontSize: 26, fontFamily: 'Nunito-ExtraBold', textAlign: 'center', marginBottom: 16 },
  desc: { fontSize: 16, fontFamily: 'Nunito-Regular', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  skip: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  btn: { borderRadius: 24, paddingHorizontal: 28, paddingVertical: 14 },
  btnText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 16 },
});