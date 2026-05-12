import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';
import type { GameModeConfig } from '../../constants/gameModes';

interface Props {
  mode: GameModeConfig;
  personalBest?: number;
  onPress: () => void;
}

export function ModeCard({ mode, personalBest, onPress }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: C.bgSecondary, borderColor: mode.color + '55' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[s.iconBg, { backgroundColor: mode.color + '22' }]}>
        <Text style={s.icon}>{mode.icon}</Text>
      </View>
      <Text style={[s.name, { color: C.textPrimary }]} numberOfLines={1}>{mode.name}</Text>
      {personalBest !== undefined && (
        <Text style={[s.score, { color: C.accentYellow }]}>🏆 {personalBest.toLocaleString('tr-TR')}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1, margin: 6, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1.5, minHeight: 110,
  },
  iconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  icon: { fontSize: 26 },
  name: { fontSize: 13, fontFamily: 'Nunito-Bold', textAlign: 'center', marginBottom: 4 },
  score: { fontSize: 11, fontFamily: 'Nunito-SemiBold' },
});
