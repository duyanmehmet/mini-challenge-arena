import { View, Text, StyleSheet } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';

interface Props { amount: number; size?: 'sm' | 'md' | 'lg' }

export function CoinDisplay({ amount, size = 'md' }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 20 : 16;

  return (
    <View style={s.row}>
      <Text style={{ fontSize: fontSize + 2 }}>🪙</Text>
      <Text style={[s.text, { color: C.accentYellow, fontSize }]}>{amount.toLocaleString('tr-TR')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontFamily: 'Nunito-Bold', fontWeight: '700' },
});
