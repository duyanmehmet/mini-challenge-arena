import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import api from '../src/services/api';
import { useUserStore } from '../src/store/userStore';

const { width } = Dimensions.get('window');

const BG       = '#111827';
const CARD     = '#1f2937';
const ORANGE   = '#f97316';
const ORANGE2  = '#fb923c';
const MUTED    = '#6b7280';
const TEXT     = '#f9fafb';
const BORDER   = '#374151';

const TR_DAYS  = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'];
const TR_MONTHS = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',
];

// YYYY-MM-DD formatında bugün
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Aylık takvim verisi
function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Pazar
  // Pazartesi başlangıçlı: Pazar → 6, diğerleri → day-1
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // 7'nin katına tamamla
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

// ── Alev animasyonu ───────────────────────────────────────────────────
function AnimFlame({ size = 72 }: { size?: number }) {
  const sc = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(sc, { toValue: 1.15, duration: 600, useNativeDriver: true }),
      Animated.timing(sc, { toValue: 0.95, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.Text style={{ fontSize: size, transform: [{ scale: sc }] }}>🔥</Animated.Text>
  );
}

// ── Hedef listesi ─────────────────────────────────────────────────────
const GOALS = [
  { days: 3,   label: '3 Günlük Seri',   reward: '50 🪙'  },
  { days: 7,   label: '7 Günlük Seri',   reward: '150 🪙' },
  { days: 14,  label: '14 Günlük Seri',  reward: '300 🪙' },
  { days: 30,  label: '1 Aylık Seri',    reward: '750 🪙' },
  { days: 100, label: '100 Günlük Seri', reward: '2.000 🪙 + Özel Rozet' },
];

export default function StreakScreen() {
  const { user } = useUserStore();
  const [tab,         setTab]         = useState<'kisisel' | 'arkadas'>('kisisel');
  const [data,        setData]        = useState<{
    streakCount: number; maxStreak: number;
    lastPlayedDate: string | null; playedDates: string[];
  } | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [calYear,     setCalYear]     = useState(new Date().getFullYear());
  const [calMonth,    setCalMonth]    = useState(new Date().getMonth());

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.get('/user/streak-history')
      .then(r => {
        setData(r.data);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const today        = todayStr();
  const playedSet    = new Set(data?.playedDates ?? []);
  const playedToday  = playedSet.has(today);
  const streak       = data?.streakCount ?? user?.streakCount ?? 0;
  const maxStreak    = data?.maxStreak ?? 0;
  const freezeDate   = data?.freezeDate ?? null;
  const frozeToday   = freezeDate === today;

  const cells = buildCalendar(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    if (calYear > now.getFullYear() || (calYear === now.getFullYear() && calMonth >= now.getMonth())) return;
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Text style={s.closeTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Seri</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tab, tab === 'kisisel' && s.tabActive]} onPress={() => setTab('kisisel')}>
          <Text style={[s.tabTxt, tab === 'kisisel' && s.tabTxtActive]}>KİŞİSEL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'arkadas' && s.tabActive]} onPress={() => setTab('arkadas')}>
          <Text style={[s.tabTxt, tab === 'arkadas' && s.tabTxtActive]}>ARKADAŞ</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadWrap}><ActivityIndicator color={ORANGE} size="large" /></View>
      ) : tab === 'arkadas' ? (
        <View style={s.loadWrap}>
          <Text style={{ fontSize: 40 }}>🔥</Text>
          <Text style={[s.emptyTxt, { marginTop: 12 }]}>Arkadaş seri karşılaştırması{'\n'}yakında geliyor!</Text>
        </View>
      ) : (
        <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>

          {/* Büyük seri sayacı */}
          <View style={s.heroSection}>
            <AnimFlame size={80} />
            <View style={s.heroRow}>
              <Text style={s.heroCount}>{streak}</Text>
              <Text style={s.heroLabel}>günlük seri!</Text>
            </View>
            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statNum}>{streak}</Text>
                <Text style={s.statLabel}>Mevcut</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBox}>
                <Text style={s.statNum}>{maxStreak}</Text>
                <Text style={s.statLabel}>En İyi</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statBox}>
                <Text style={s.statNum}>{playedSet.size}</Text>
                <Text style={s.statLabel}>Toplam Gün</Text>
              </View>
            </View>
          </View>

          {/* Bugün oyna CTA */}
          {!playedToday && !frozeToday && (
            <TouchableOpacity style={s.ctaCard} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
              <View style={s.ctaLeft}>
                <View style={s.ctaClock}><Text style={{ fontSize: 20 }}>⏱️</Text></View>
                <View>
                  <Text style={s.ctaTitle}>Bugün bir oyun oyna!</Text>
                  <Text style={s.ctaSub}>Serini kırmadan devam et</Text>
                </View>
              </View>
              <Text style={s.ctaBtn}>OYNA</Text>
            </TouchableOpacity>
          )}

          {frozeToday && !playedToday && (
            <View style={[s.ctaCard, { borderColor: '#3b82f644' }]}>
              <View style={s.ctaLeft}>
                <View style={[s.ctaClock, { backgroundColor: '#1e3a5f' }]}><Text style={{ fontSize: 20 }}>🧊</Text></View>
                <View>
                  <Text style={s.ctaTitle}>Serin donduruldu!</Text>
                  <Text style={s.ctaSub}>Bugün oynamasan bile 🔥 korunuyor</Text>
                </View>
              </View>
            </View>
          )}

          {playedToday && (
            <View style={[s.ctaCard, { borderColor: '#16a34a44' }]}>
              <View style={s.ctaLeft}>
                <View style={[s.ctaClock, { backgroundColor: '#d1fae5' }]}><Text style={{ fontSize: 20 }}>✅</Text></View>
                <View>
                  <Text style={s.ctaTitle}>Bugün oynadın!</Text>
                  <Text style={s.ctaSub}>Serin devam ediyor 🔥</Text>
                </View>
              </View>
            </View>
          )}

          {/* Seri Takvimi */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Seri Takvimi</Text>
            <View style={s.calCard}>
              {/* Ay navigasyon */}
              <View style={s.calHeader}>
                <TouchableOpacity onPress={prevMonth} style={s.calNavBtn}>
                  <Text style={s.calNavTxt}>‹</Text>
                </TouchableOpacity>
                <Text style={s.calMonthTxt}>{TR_MONTHS[calMonth]} {calYear}</Text>
                <TouchableOpacity onPress={nextMonth} style={s.calNavBtn}>
                  <Text style={s.calNavTxt}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Gün başlıkları */}
              <View style={s.calWeekRow}>
                {TR_DAYS.map(d => (
                  <Text key={d} style={s.calDayHead}>{d}</Text>
                ))}
              </View>

              {/* Günler */}
              <View style={s.calGrid}>
                {cells.map((day, i) => {
                  if (!day) return <View key={`e-${i}`} style={s.calCell} />;
                  const dateStr   = toDateStr(calYear, calMonth, day);
                  const isToday   = dateStr === today;
                  const isPlayed  = playedSet.has(dateStr);
                  const isFuture  = dateStr > today;
                  return (
                    <View key={dateStr} style={s.calCell}>
                      <View style={[
                        s.calDayWrap,
                        isPlayed && s.calDayPlayed,
                        isToday && !isPlayed && s.calDayToday,
                      ]}>
                        <Text style={[
                          s.calDayTxt,
                          isPlayed && s.calDayTxtPlayed,
                          isToday && !isPlayed && s.calDayTxtToday,
                          isFuture && s.calDayTxtFuture,
                        ]}>{day}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Lejant */}
              <View style={s.legend}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: ORANGE }]} />
                  <Text style={s.legendTxt}>Oynadın</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: '#374151' }]} />
                  <Text style={s.legendTxt}>Bugün</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Seri Hedefleri */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Seri Hedefi</Text>
            <View style={s.goalList}>
              {GOALS.map(goal => {
                const done = streak >= goal.days;
                const pct  = Math.min(streak / goal.days, 1);
                return (
                  <View key={goal.days} style={[s.goalCard, done && s.goalCardDone]}>
                    <View style={s.goalLeft}>
                      <Text style={{ fontSize: 28 }}>{done ? '✅' : '🔥'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.goalLabel, done && { color: '#4ade80' }]}>{goal.label}</Text>
                        <View style={s.goalBarBg}>
                          <View style={[s.goalBarFill, { width: `${pct * 100}%` as any, backgroundColor: done ? '#22c55e' : ORANGE }]} />
                        </View>
                        <Text style={s.goalProg}>{Math.min(streak, goal.days)} / {goal.days} gün</Text>
                      </View>
                    </View>
                    <View style={[s.goalReward, done && { backgroundColor: '#14532d' }]}>
                      <Text style={[s.goalRewardTxt, done && { color: '#4ade80' }]}>{goal.reward}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

const CELL_SIZE = Math.floor((width - 48 - 24) / 7);

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: BG },
  loadWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTxt:{ fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 22 },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  closeBtn:    { width: 36, height: 36, borderRadius: 12, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  closeTxt:    { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT },
  headerTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },

  // Tabs
  tabBar:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER, marginHorizontal: 16, marginBottom: 8 },
  tab:         { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabActive:   { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
  tabTxt:      { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: MUTED, letterSpacing: 0.5 },
  tabTxtActive:{ color: '#3b82f6' },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  heroRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  heroCount:   { fontFamily: 'Nunito-ExtraBold', fontSize: 64, color: TEXT, lineHeight: 70 },
  heroLabel:   { fontFamily: 'Nunito-Bold', fontSize: 20, color: MUTED, marginBottom: 10 },
  statsRow:    { flexDirection: 'row', backgroundColor: CARD, borderRadius: 18, marginHorizontal: 24, paddingVertical: 14, paddingHorizontal: 20, gap: 16, marginTop: 8, borderWidth: 1, borderColor: BORDER },
  statBox:     { flex: 1, alignItems: 'center', gap: 4 },
  statNum:     { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: ORANGE },
  statLabel:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED },
  statDivider: { width: 1, backgroundColor: BORDER },

  // CTA
  ctaCard:  { marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: ORANGE + '44' },
  ctaLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  ctaClock: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#431407', alignItems: 'center', justifyContent: 'center' },
  ctaTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: TEXT, marginBottom: 2 },
  ctaSub:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  ctaBtn:   { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: '#3b82f6' },

  // Bölüm
  section:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT, marginBottom: 12 },

  // Takvim
  calCard:     { backgroundColor: CARD, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: BORDER },
  calHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  calNavBtn:   { width: 32, height: 32, borderRadius: 10, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  calNavTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT, lineHeight: 26 },
  calMonthTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  calWeekRow:  { flexDirection: 'row', marginBottom: 6 },
  calDayHead:  { width: CELL_SIZE, textAlign: 'center', fontFamily: 'Nunito-Bold', fontSize: 11, color: MUTED },
  calGrid:     { flexDirection: 'row', flexWrap: 'wrap' },
  calCell:     { width: CELL_SIZE, alignItems: 'center', paddingVertical: 3 },
  calDayWrap:  { width: CELL_SIZE - 4, height: CELL_SIZE - 4, borderRadius: (CELL_SIZE - 4) / 2, alignItems: 'center', justifyContent: 'center' },
  calDayPlayed:{ backgroundColor: ORANGE },
  calDayToday: { backgroundColor: '#374151' },
  calDayTxt:   { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED },
  calDayTxtPlayed: { color: '#fff', fontFamily: 'Nunito-ExtraBold' },
  calDayTxtToday:  { color: TEXT, fontFamily: 'Nunito-ExtraBold' },
  calDayTxtFuture: { color: '#4b5563' },

  legend:     { flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendTxt:  { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED },

  // Hedefler
  goalList:    { gap: 10 },
  goalCard:    { backgroundColor: CARD, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER },
  goalCardDone:{ borderColor: '#15803d' },
  goalLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  goalLabel:   { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: TEXT, marginBottom: 6 },
  goalBarBg:   { height: 5, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  goalBarFill: { height: 5, borderRadius: 3 },
  goalProg:    { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED },
  goalReward:  { backgroundColor: '#431407', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-end' },
  goalRewardTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: ORANGE },
});
