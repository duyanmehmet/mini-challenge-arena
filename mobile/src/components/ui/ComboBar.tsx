import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../store/settingsStore';

interface Props {
  combo: number;
}

export function ComboBar({ combo }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (combo > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [combo]);

  if (combo < 2) return <View style={{ height: 30 }} />;

  return (
    <Animated.View style={[s.container, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={[s.text, { color: combo >= 10 ? C.accentRed : C.accentYellow }]}>
        🔥 {combo} COMBO
      </Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { height: 30, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, fontFamily: 'Nunito-ExtraBold', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
});
