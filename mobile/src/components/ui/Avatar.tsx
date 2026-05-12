import { View, Text, StyleSheet } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';

const AVATARS = ['🐺','🦊','🐯','🦁','🐻','🐼','🦝','🐨','🦄','🐲'];

interface Props { avatarId: number; size?: number }

export function Avatar({ avatarId, size = 48 }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const emoji = AVATARS[(avatarId - 1) % AVATARS.length] ?? '🐺';

  return (
    <View style={[s.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: C.bgTertiary }]}>
      <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
