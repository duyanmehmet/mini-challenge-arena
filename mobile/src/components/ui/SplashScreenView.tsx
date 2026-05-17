import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BG = '#0d0d1a';

export function SplashScreenView() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0.6)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // İkon + metin beliriyor
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
      }),
    ]).start();

    // Beyin ikon nabız efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Progress bar 0 → %100 (2.5 saniye)
    Animated.timing(progressAnim, {
      toValue: 1, duration: 2500, useNativeDriver: false,
    }).start();
  }, []);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.55],
  });

  return (
    <View style={s.root}>
      {/* Arka plan parıltı (büyük glow çemberi) */}
      <View style={s.glowCircle} />

      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Beyin ikonu */}
        <Animated.View style={[s.iconWrapper, { opacity: glowAnim }]}>
          <View style={s.iconGlow}>
            <Text style={s.icon}>🧠</Text>
          </View>
        </Animated.View>

        {/* Başlık */}
        <Text style={s.title}>ZEKA{'\n'}MEYDANI</Text>

        {/* Tagline */}
        <Text style={s.tagline}>Bilgiyle yarış, zafere ulaş!</Text>
      </Animated.View>

      {/* Progress bar */}
      <View style={s.barContainer}>
        <Animated.View style={[s.bar, { width: barWidth }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Büyük mor/mavi glow çemberi arka planda
  glowCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'transparent',
    shadowColor: '#6c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 80,
    elevation: 0,
    // Android için renk tabakası
    borderWidth: 0,
  },

  content: {
    alignItems: 'center',
    gap: 0,
  },

  // İkon sarmalayıcı — glow efekti
  iconWrapper: {
    marginBottom: 28,
  },
  iconGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1040',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 1.5,
    borderColor: '#4c1d95',
  },
  icon: {
    fontSize: 80,
  },

  // Başlık
  title: {
    fontSize: 42,
    fontFamily: 'Nunito-ExtraBold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 6,
    lineHeight: 50,
    textShadowColor: '#7c3aed',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 14,
  },

  // Tagline
  tagline: {
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    color: '#a78bfa',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Progress bar
  barContainer: {
    position: 'absolute',
    bottom: 90,
    width: width * 0.55,
    height: 3,
    backgroundColor: '#1e1b4b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});
