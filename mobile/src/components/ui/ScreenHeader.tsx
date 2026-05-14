import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, right }: Props) {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top + 6, backgroundColor: C.bgPrimary }]}>
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={s.backBtn}
      >
        <Text style={[s.backIcon, { color: C.textSecondary }]}>←</Text>
      </TouchableOpacity>
      <Text style={[s.title, { color: C.textPrimary }]} numberOfLines={1}>{title}</Text>
      <View style={s.right}>{right ?? null}</View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn:  { width: 36, height: 36, justifyContent: 'center' },
  backIcon: { fontSize: 22 },
  title:    { fontFamily: 'Nunito-ExtraBold', fontSize: 18, flex: 1, textAlign: 'center' },
  right:    { width: 36, alignItems: 'flex-end' },
});
