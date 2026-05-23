import { useState, useCallback, useRef, useEffect } from 'react';
import { Share } from 'react-native';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  ScrollView, Animated, Dimensions, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Avatar } from '../../src/components/ui/Avatar';
import api from '../../src/services/api';
import { BANNER_ID } from '../../src/services/admob.service';

const { width } = Dimensions.get('window');

const BG    = '#ffffff';
const CARD  = '#ffffff';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const GOLD  = '#f59e0b';
const GREEN = '#22c55e';
const RED   = '#ef4444';
const BORDER= '#2e2b5a';

const LEAGUES = [
  // Başlangıç (1-5)
  { id: 'filiz',    name: 'Filiz',    emoji: '🌱', color: '#86efac' },
  { id: 'kaya',     name: 'Kaya',     emoji: '🪨', color: '#a8a29e' },
  { id: 'demir',    name: 'Demir',    emoji: '🔩', color: '#94a3b8' },
  { id: 'celik',    name: 'Çelik',    emoji: '⚔️', color: '#64748b' },
  { id: 'bronz',    name: 'Bronz',    emoji: '🥉', color: '#cd7f32' },
  // Orta (6-10)
  { id: 'gumus',    name: 'Gümüş',    emoji: '🥈', color: '#9ca3af' },
  { id: 'altin',    name: 'Altın',    emoji: '🥇', color: '#f59e0b' },
  { id: 'safir',    name: 'Safir',    emoji: '🔵', color: '#3b82f6' },
  { id: 'zumrut',   name: 'Zümrüt',   emoji: '💚', color: '#22c55e' },
  { id: 'elmas',    name: 'Elmas',    emoji: '💎', color: '#06b6d4' },
  // İyi (11-15)
  { id: 'platin',   name: 'Platin',   emoji: '🔷', color: '#38bdf8' },
  { id: 'kristal',  name: 'Kristal',  emoji: '🌟', color: '#e2e8f0' },
  { id: 'mistik',   name: 'Mistik',   emoji: '🔮', color: '#a855f7' },
  { id: 'ay',       name: 'Ay',       emoji: '🌙', color: '#c4b5fd' },
  { id: 'gunes',    name: 'Güneş',    emoji: '☀️', color: '#fbbf24' },
  // Harika (16-20)
  { id: 'simsek',   name: 'Şimşek',   emoji: '⚡', color: '#facc15' },
  { id: 'alev',     name: 'Alev',     emoji: '🔥', color: '#f97316' },
  { id: 'okyanus',  name: 'Okyanus',  emoji: '🌊', color: '#0ea5e9' },
  { id: 'zirve',    name: 'Zirve',    emoji: '🏔️', color: '#e2e8f0' },
  { id: 'kartal',   name: 'Kartal',   emoji: '🦅', color: '#854d0e' },
  // Efsane (21-25)
  { id: 'ejderha',  name: 'Ejderha',  emoji: '🐉', color: '#dc2626' },
  { id: 'galaksi',  name: 'Galaksi',  emoji: '🌌', color: '#6366f1' },
  { id: 'nova',     name: 'Nova',     emoji: '💫', color: '#f0abfc' },
  { id: 'efsane',   name: 'Efsane',   emoji: '🦄', color: '#e879f9' },
  { id: 'kral',     name: 'Kral',     emoji: '👑', color: '#fde047' },
  // Şampiyon (26-30)
  { id: 'yildiz',   name: 'Yıldız',   emoji: '⭐', color: '#fef08a' },
  { id: 'meteor',   name: 'Meteor',   emoji: '🌠', color: '#fb923c' },
  { id: 'zafer',    name: 'Zafer',    emoji: '🏆', color: '#f59e0b' },
  { id: 'elit',     name: 'Elit',     emoji: '🎯', color: '#f43f5e' },
  { id: 'sampiyon', name: 'Şampiyon', emoji: '🏅', color: '#a78bfa' },
];

function useCountdownDays(targetIso: string) {
  const [text, setText] = useState('');
  useFocusEffect(useCallback(() => {
    const update = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setText('Bitti'); return; }
      const days = Math.floor(diff / 86400000);
      if (days >= 1) setText(`${days} GÜN`);
      else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setText(`${h}s ${m}dk`);
      }
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetIso]));
  return text;
}

export default function SiralamaScreen() {
  const { user } = useUserStore();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [ligInfo,     setLigInfo]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/lig/leaderboard'),
      api.get('/lig/current'),
    ]).then(([lb, cur]) => {
      setLeaderboard(lb.data ?? []);
      setLigInfo(cur.data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }).catch(() => {}).finally(() => setLoading(false));
  }, []));

  const league      = (user as any)?.currentLeague ?? 'filiz';
  const currentIdx  = Math.max(0, LEAGUES.findIndex(l => l.id === league));
  const leagueCfg   = LEAGUES[currentIdx] ?? LEAGUES[0];
  const countdown   = useCountdownDays(ligInfo?.weekEndsAt ?? new Date(Date.now() + 86400000 * 4).toISOString());

  // Görünür ligler: geçilenler + mevcut + sonraki 2
  const visibleLeagues = LEAGUES.filter((_, i) => i <= currentIdx + 2);

  const PROMOTE_COUNT = 5;
  const RELEGATE_COUNT = Math.max(0, leaderboard.length - 5);
  const relStart = leaderboard.length - 5;

  // Satır render
  const renderRow = (item: any, index: number) => {
    const isMe      = item.username === user?.username;
    const isTop3    = index < 3;
    const isPromote = index < PROMOTE_COUNT;
    const isRelegate= index >= relStart && leaderboard.length >= 10;
    const medal     = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

    return (
      <View
        key={String(index)}
        style={[
          s.row,
          isMe       && s.rowMe,
          isPromote  && !isMe && s.rowPromote,
          isRelegate && !isMe && s.rowRelegate,
        ]}
      >
        {/* Sıra */}
        <View style={s.rankWrap}>
          {medal
            ? <Text style={{ fontSize: 22 }}>{medal}</Text>
            : <Text style={[s.rankNum, isMe && { color: PURP2 }]}>{index + 1}</Text>
          }
        </View>

        {/* Avatar */}
        <Avatar avatarId={item.avatar_id ?? 1} size={40} />

        {/* İsim */}
        <Text style={[s.name, isMe && { color: PURP2 }]} numberOfLines={1}>
          {item.username}{isMe ? ' 👈' : ''}
        </Text>

        {/* Puan */}
        <Text style={[s.score, isTop3 && { color: GOLD }]}>
          {(item.weekly_score ?? 0).toLocaleString('tr-TR')} Puan
        </Text>

        {/* Ok */}
        {isPromote  && <Text style={s.upArrow}>▲</Text>}
        {isRelegate && <Text style={s.downArrow}>▼</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.root}>
      {/* ── Başlık ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[s.leagueTitle, { color: leagueCfg.color }]}>
          {leagueCfg.emoji} {leagueCfg.name} Ligi
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {countdown ? (
            <View style={s.countdown}>
              <Text style={s.countdownIcon}>⏳</Text>
              <Text style={s.countdownTxt}>{countdown}</Text>
            </View>
          ) : null}
          {ligInfo && (
            <TouchableOpacity
              style={{ backgroundColor: '#ede9fe', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#c4b5fd' }}
              onPress={() => Share.share({ message: `Zeka Meydanı'nda ${leagueCfg.name} Ligi'nde #${ligInfo.userRank}. sıradayım! ${ligInfo.userScore?.toLocaleString('tr-TR')} puan yaptım. Sen geçebilir misin? 🏆` })}
            >
              <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 12, color: '#7c3aed' }}>📤 Paylaş</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Kupa satırı — sadece erişilebilen ligler ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.trophyRow}
      >
        {visibleLeagues.map((l, i) => {
          const isActive  = l.id === league;
          const isPassed  = i < currentIdx;
          const isLocked  = i > currentIdx;        // sonraki 2: kilitli görünür
          const isNext    = i === currentIdx + 1;  // hemen sonraki
          return (
            <View key={l.id} style={[s.trophyItem, isActive && s.trophyActive]}>
              <View style={[
                s.trophyCircle,
                { borderColor: l.color + (isActive ? 'ee' : isPassed ? '55' : isNext ? '44' : '22') },
                isActive && { backgroundColor: l.color + '25' },
                isLocked && { opacity: 0.5 },
              ]}>
                {isLocked
                  ? <Text style={s.trophyEmoji}>🔒</Text>
                  : <Text style={[s.trophyEmoji, { opacity: isPassed ? 0.6 : 1 }]}>{l.emoji}</Text>
                }
              </View>
              {/* İsim etiketi */}
              <Text style={[
                s.trophyName,
                { color: isActive ? l.color : isLocked ? '#d1d5db' : MUTED },
                isActive && { fontFamily: 'Nunito-ExtraBold' },
              ]}>
                {isLocked ? '???' : l.name}
              </Text>
              {isActive && <View style={[s.trophyDot, { backgroundColor: l.color }]} />}
            </View>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={PURP2} size="large" /></View>
      ) : leaderboard.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 56 }}>🏁</Text>
          <Text style={s.emptyTxt}>Henüz kimse oynamadı</Text>
          <Text style={s.emptySub}>İlk sen ol ve liderliği kap!</Text>
        </View>
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          style={{ opacity: fadeAnim }}
        >
          {/* TERFİ DİLİMİ */}
          <View style={s.zoneLabel}>
            <Text style={s.zoneLabelIcon}>▲</Text>
            <Text style={[s.zoneLabelTxt, { color: GREEN }]}>ŞAMPİYONLUK HATTI</Text>
            <Text style={s.zoneLabelIcon}>▲</Text>
          </View>

          {leaderboard.slice(0, PROMOTE_COUNT).map((item, i) => renderRow(item, i))}

          {/* NORMAL DİLİM */}
          {leaderboard.length > PROMOTE_COUNT + 5 && (
            <>
              <View style={s.divider} />
              {leaderboard.slice(PROMOTE_COUNT, relStart).map((item, i) => renderRow(item, i + PROMOTE_COUNT))}
            </>
          )}

          {/* DÜŞME DİLİMİ */}
          {leaderboard.length >= 10 && (
            <>
              <View style={s.divider} />
              <View style={s.zoneLabel}>
                <Text style={s.zoneLabelIcon}>▼</Text>
                <Text style={[s.zoneLabelTxt, { color: RED }]}>TEHLİKE BÖLGESİ</Text>
                <Text style={s.zoneLabelIcon}>▼</Text>
              </View>
              {leaderboard.slice(relStart).map((item, i) => renderRow(item, i + relStart))}
            </>
          )}

          <View style={{ height: 32 }} />
        </Animated.ScrollView>
      )}

      {/* Banner reklam — ekranın en altında */}
      <BannerAdView />
    </SafeAreaView>
  );
}

function BannerAdView() {
  const [BannerAd, setBannerAd] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);

  useEffect(() => {
    import('react-native-google-mobile-ads').then(m => {
      setBannerAd(() => m.BannerAd);
      setBannerAdSize(m.BannerAdSize);
    }).catch(() => {});
  }, []);

  if (!BannerAd || !BannerAdSize) return null;
  return (
    <View style={{ alignItems: 'center', backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingVertical: 4 }}>
      <BannerAd
        unitId={BANNER_ID ?? ''}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 20, paddingBottom: 8, gap: 8 },
  backBtn:      { backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  backTxt:      { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  leagueTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 18, flex: 1, textAlign: 'center' },
  countdown:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  countdownIcon:{ fontSize: 14 },
  countdownTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#374151' },

  // Kupa satırı
  trophyRow:    { paddingHorizontal: 16, paddingVertical: 12, gap: 16, alignItems: 'center' },
  trophyItem:   { alignItems: 'center', gap: 4 },
  trophyActive: { transform: [{ scale: 1.15 }] },
  trophyCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
  trophyEmoji:  { fontSize: 26 },
  trophyDot:    { width: 6, height: 6, borderRadius: 3 },
  trophyName:   { fontFamily: 'Nunito-Regular', fontSize: 10, color: '#9ca3af', marginTop: 2 },

  // Liste
  list:       { paddingHorizontal: 16 },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff' },
  emptyTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827' },
  emptySub:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#9ca3af' },

  // Zone labels
  zoneLabel:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  zoneLabelIcon:{ fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#9ca3af' },
  zoneLabelTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, letterSpacing: 1.5 },

  divider:    { height: 1, backgroundColor: '#f3f4f6', marginVertical: 4 },

  // Satırlar
  row:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 16, marginBottom: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  rowMe:      { borderColor: PURP2, backgroundColor: '#f5f3ff' },
  rowPromote: { borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  rowRelegate:{ borderColor: '#fca5a5', backgroundColor: '#fff1f2' },

  rankWrap:   { width: 32, alignItems: 'center' },
  rankNum:    { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#9ca3af' },
  name:       { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: '#111827' },
  score:      { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: '#374151' },
  upArrow:    { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: GREEN },
  downArrow:  { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: RED },
});
