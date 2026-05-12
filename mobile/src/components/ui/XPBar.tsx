import { View, Text, StyleSheet } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';

interface Props {
  xp: number;
  level: number;
}

const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 10000, 15000, 25000, 40000, 60000, 80000, 100000];

export function XPBar({ xp, level }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const current = XP_THRESHOLDS[level - 1] ?? 0;
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const progress = Math.min((xp - current) / (next - current), 1);

  return (
    <View style={s.container}>
      <View style={[s.track, { backgroundColor: C.bgTertiary }]}>
        <View style={[s.fill, { width: `${progress * 100}%`, backgroundColor: C.accentTeal }]} />
      </View>
      <Text style={[s.label, { color: C.textSecondary }]}>
        {xp} / {next} XP
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { width: '100%' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  fill: { height: '100%', borderRadius: 4 },
  label: { fontSize: 11, fontFamily: 'Nunito-Regular', textAlign: 'right' },
});
