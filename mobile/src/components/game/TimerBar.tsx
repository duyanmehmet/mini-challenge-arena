import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../store/settingsStore';

interface TimerBarProps {
  duration: number; // seconds
  onTimeUp: () => void;
  isPlaying: boolean;
}

export const TimerBar: React.FC<TimerBarProps> = ({ duration, onTimeUp, isPlaying }) => {
  const { theme } = useSettingsStore();
  const colors = Colors[theme];
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.timing(progress, {
        toValue: 0,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          onTimeUp();
        }
      });
    } else {
      progress.stopAnimation();
    }
  }, [isPlaying, duration]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const barColor = progress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [colors.accentRed, colors.accentYellow, colors.accentTeal],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bgTertiary }]}>
      <Animated.View style={[styles.bar, { width, backgroundColor: barColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bar: {
    height: '100%',
  },
});
