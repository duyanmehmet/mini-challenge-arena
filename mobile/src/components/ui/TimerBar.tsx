import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  timeLeft: number;
  totalTime: number;
  theme: 'light' | 'dark';
}

export function TimerBar({ timeLeft, totalTime, theme }: Props) {
  const C = Colors[theme];
  const widthAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: timeLeft / totalTime,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const barColor = timeLeft / totalTime < 0.2 ? C.danger : C.accentTeal;

  return (
    <View style={[s.container, { backgroundColor: C.bgTertiary }]}>
      <Animated.View style={[s.fill, { 
        width: widthAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', '100%']
        }),
        backgroundColor: barColor 
      }]} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { height: 6, width: '100%', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
