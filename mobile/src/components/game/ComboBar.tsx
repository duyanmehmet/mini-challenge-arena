import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Typography } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../store/settingsStore';

interface ComboBarProps {
  combo: number;
}

export const ComboBar: React.FC<ComboBarProps> = ({ combo }) => {
  const { theme } = useSettingsStore();
  const colors = Colors[theme];
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (combo > 0) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [combo]);

  if (combo < 2) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Typography variant="h1" color={colors.accentYellow} style={styles.text}>
          {combo}x COMBO!
        </Typography>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 10,
  },
  text: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
});
