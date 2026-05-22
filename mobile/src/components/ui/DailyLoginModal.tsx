import { useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface Props {
  visible: boolean;
  coinReward: number;
  newStreak: number;
  onClose: () => void;
}

export function DailyLoginModal({ visible, coinReward, newStreak, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.75);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const DAYS = [1, 2, 3, 4, 5, 6, 7];
  const isWeek = newStreak >= 7;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }] }]}>

          <Text style={s.emoji}>{isWeek ? '🔥' : '🎁'}</Text>
          <Text style={s.title}>
            {isWeek ? '7 Günlük Seri!' : 'Günlük Ödül'}
          </Text>
          <Text style={s.sub}>Bugün de geri döndüğün için teşekkürler!</Text>

          {/* 7 günlük takvim */}
          <View style={s.daysRow}>
            {DAYS.map(d => {
              const earned  = d < newStreak;
              const isToday = d === Math.min(newStreak, 7);
              return (
                <View
                  key={d}
                  style={[
                    s.dayBox,
                    earned  && s.dayEarned,
                    isToday && s.dayToday,
                  ]}
                >
                  {earned || isToday
                    ? <Text style={[s.checkMark, isToday && { color: '#fff' }]}>✓</Text>
                    : <Text style={s.dayNum}>{d}</Text>
                  }
                </View>
              );
            })}
          </View>

          {/* Coin ödülü */}
          <View style={s.rewardBox}>
            <Text style={s.rewardEmoji}>🪙</Text>
            <Text style={s.coinNum}>+{coinReward}</Text>
            <Text style={s.coinLabel}>coin kazandın!</Text>
          </View>

          {newStreak >= 2 && (
            <Text style={s.streakTxt}>
              {newStreak >= 7
                ? '🏆 7 günlük seri — maksimum ödül!'
                : `${newStreak} günlük seri 🔥 — devam et, ödül artıyor!`}
            </Text>
          )}

          <TouchableOpacity style={s.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.btnTxt}>Harika! 🎉</Text>
          </TouchableOpacity>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const PURP = '#6c3aed';

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 28,
    padding: 28, width: '100%', maxWidth: 360,
    alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2, shadowRadius: 30, elevation: 20,
  },

  emoji: { fontSize: 52 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 24, color: '#111827', textAlign: 'center', marginTop: -6 },
  sub:   { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: -6 },

  daysRow:  { flexDirection: 'row', gap: 7, marginVertical: 2 },
  dayBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center',
  },
  dayEarned: { backgroundColor: '#ede9fe', borderColor: '#8b5cf6' },
  dayToday:  { backgroundColor: PURP, borderColor: PURP },
  dayNum:    { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#9ca3af' },
  checkMark: { fontFamily: 'Nunito-Bold', fontSize: 14, color: PURP },

  rewardBox: {
    alignItems: 'center', gap: 2,
    backgroundColor: '#fef9c3', borderRadius: 20,
    paddingHorizontal: 36, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#fde68a',
  },
  rewardEmoji: { fontSize: 36 },
  coinNum:   { fontFamily: 'Nunito-ExtraBold', fontSize: 34, color: '#d97706', marginTop: -2 },
  coinLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#92400e' },

  streakTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: PURP, textAlign: 'center' },

  btn:    { width: '100%', backgroundColor: PURP, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 2 },
  btnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' },
});
