import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const bg = {
    primary: C.accentRed,
    secondary: C.bgTertiary,
    outline: 'transparent',
    danger: C.danger,
  }[variant];

  const textColor = variant === 'outline' ? C.accentRed : '#fff';
  const border = variant === 'outline' ? { borderWidth: 2, borderColor: C.accentRed } : {};

  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: bg }, border, disabled && s.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={[s.text, { color: textColor }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { borderRadius: 12, padding: 14, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, fontWeight: '700', fontFamily: 'Nunito-Bold' },
  disabled: { opacity: 0.5 },
});
