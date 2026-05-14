import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from '../ui/Typography';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../store/settingsStore';
import { useGameStore } from '../../store/gameStore';

interface ScoreBarProps { showLives?: boolean; }

export const ScoreBar: React.FC<ScoreBarProps> = ({ showLives = false }) => {
  const { theme } = useSettingsStore();
  const { score, combo, lives } = useGameStore();
  const colors = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={styles.section}>
        <Typography variant="small" color={colors.textSecondary}>SKOR</Typography>
        <Typography variant="h2">{score}</Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="small" color={colors.textSecondary}>COMBO</Typography>
        <Typography variant="h2" color={colors.accentTeal}>x{combo}</Typography>
      </View>

      {showLives && (
        <View style={styles.section}>
          <Typography variant="small" color={colors.textSecondary}>CAN</Typography>
          <View style={styles.livesRow}>
            {[...Array(3)].map((_, i) => (
              <Typography key={i} variant="h2" style={{ opacity: i < lives ? 1 : 0.2 }}>
                ❤️
              </Typography>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    alignItems: 'center',
  },
  livesRow: {
    flexDirection: 'row',
  },
});
