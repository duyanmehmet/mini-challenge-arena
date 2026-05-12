import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { Colors } from '../../constants/colors';
import type { CategoryConfig as GameModeConfig } from '../../constants/categories';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;   // 2 sutun, kenarlarda 12px bosluk

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
      style={[s.card, {
        width: CARD_W,
        backgroundColor: C.bgSecondary,
        borderColor: mode.color + '66',
      }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Renkli arka plan degrade etkisi */}
      <View style={[s.colorBar, { backgroundColor: mode.color }]} />

      {/* Ikon */}
      <View style={[s.iconWrap, { backgroundColor: mode.color + '20' }]}>
        <Text style={s.icon}>{mode.icon}</Text>
      </View>

      {/* Kısa isim */}
      <Text style={[s.shortName, { color: C.textPrimary }]}>{mode.shortName}</Text>

      {/* Etiket */}
      <View style={[s.tagBadge, { backgroundColor: mode.color + '15' }]}>
        <Text style={[s.tagText, { color: mode.color }]} numberOfLines={1}>{mode.questionCount}+ soru</Text>
      </View>

      {/* Kişisel rekor */}
      {personalBest !== undefined && personalBest > 0 ? (
        <Text style={[s.pb, { color: C.accentYellow }]} numberOfLines={1}>
          🏆 {personalBest.toLocaleString('tr-TR')}
        </Text>
      ) : (
        <Text style={[s.pb, { color: C.textSecondary }]}>Oyna!</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    margin: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    paddingBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginLeft: 14,
    marginBottom: 10,
  },
  icon: { fontSize: 30 },
  shortName: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    marginHorizontal: 14,
    marginBottom: 6,
  },
  tagBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginHorizontal: 14,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
  },
  pb: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    marginHorizontal: 14,
  },
});