import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';

interface Props { children: React.ReactNode; style?: ViewStyle }

export function Card({ children, style }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  return (
    <View style={[s.card, { backgroundColor: C.cardBg, borderColor: C.border }, style]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
});
