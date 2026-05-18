import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, Alert, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Avatar } from '../src/components/ui/Avatar';
import { CATEGORIES } from '../src/constants/categories';
import api from '../src/services/api';

const { width } = Dimensions.get('window');
const CAT_CARD_W = (width - 48) / 3;

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GOLD  = '#f59e0b';
const GREEN = '#10b981';
const RED   = '#ef4444';
const BORDER= '#2e2b5a';

const LEAGUE_ICONS:  Record<string, string> = { iron: '⚙️', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '🔷', diamond: '💎', champion: '👑' };
const LEAGUE_COLORS: Record<string, string> = { iron: '#71717a', bronze: '#cd7f32', silver: '#9ca3af', gold: '#f59e0b', platinum: '#38bdf8', diamond: '#06b6d4', champion: '#a78bfa' };
const LEAGUE_NAMES:  Record<string, string> = { iron: 'Demir', bronze: 'Bronz', silver: 'Gümüş', gold: 'Altın', platinum: 'Platin', diamond: 'Elmas', champion: 'Şampiyonlar' };

interface LigInfo {
  category: { id: string; name: string; icon: string; color: string };
  weekEndsAt: string;
  userScore: number;
  userRank: number;
  leagueCount: number;
  league: string;
  hearts: number;
  maxHearts: number;
  nextHeartMinutes: number | null;
}

function useCountdown(targetIso: string) {
  const [text, setText] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setText('Bitti'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(`${h}s ${m}d ${s}sn`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return text;
}

export default function LigScreen() {
  const { user } = useUserStore();
  const [info,        setInfo]        = useState<LigInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [showCatModal, setShowCatModal] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  const loadData = async () => {
    setLoading(true);
    try {
      const [ligRes, lbRes] = await Promise.all([
        api.get('/lig/current'),
        api.get('/lig/leaderboard'),
      ]);
      setInfo(ligRes.data);
      setLeaderboard(lbRes.data ?? []);
    } catch {
      Alert.alert('Hata', 'Lig bilgisi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (categoryId?: string) => {
    const catId = categoryId ?? info?.category.id;
    if (!catId) return;
    if ((info?.hearts ?? 5) <= 0) {
      router.push('/shop' as any);
      return;
    }
    router.push({
      pathname: `/game/${catId}` as any,
      params: { ligMode: '1' },
    });
  };

  const countdown = useCountdown(info?.weekEndsAt ?? new Date(Date.now() + 86400000).toISOString());

  if (!user) return null;

  const league      = info?.league ?? (user as any).currentLeague ?? 'bronze';
  const leagueColor = LEAGUE_COLORS[league] ?? '#cd7f32';
  const leagueIcon  = LEAGUE_ICONS[league]  ?? '🥉';
  const leagueName  = LEAGUE_NAMES[league]  ?? 'Bronz';

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🏟️ Lig</Text>
        <View style={[s.leagueBadge, { borderColor: leagueColor + '80' }]}>
          <Text>{leagueIcon}</Text>
          <Text style={[s.leagueBadgeTxt, { color: leagueColor }]}>{leagueName}</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.loadWrap}>
          <ActivityIndicator color={PURP2} size="large" />
        </View>
      ) : (
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Hafta kartı */}
          {info && (
            <View style={[s.weekCard, { borderColor: (info.category.color ?? PURP) + '55' }]}>
              <View style={[s.weekIconBg, { backgroundColor: (info.category.color ?? PURP) + '20' }]}>
                <Text style={{ fontSize: 42 }}>{info.category.icon}</Text>
              </View>
              <View style={s.weekInfo}>
                <View style={s.weekBadge}>
                  <Text style={s.weekBadgeTxt}>BU HAFTA</Text>
                </View>
                <Text style={s.weekCatName}>{info.category.name}</Text>
                <View style={s.weekCountRow}>
                  <Text style={s.weekCountLabel}>⏳ Bitiş: </Text>
                  <Text style={[s.weekCountVal, { color: RED }]}>{countdown}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Sıralama + Skor */}
          {info && (
            <View style={s.statsRow}>
              <View style={s.statBox}>
                <Text style={s.statNum}>{info.userRank}.</Text>
                <Text style={s.statLabel}>Sıran</Text>
              </View>
              <View style={[s.statBox, s.statBoxMid]}>
                <Text style={[s.statNum, { color: GOLD }]}>{info.userScore.toLocaleString('tr-TR')}</Text>
                <Text style={s.statLabel}>Haftalık Puan</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statNum}>{info.leagueCount}</Text>
                <Text style={s.statLabel}>Rakip</Text>
              </View>
            </View>
          )}

          {/* Paylaşılan kalp havuzu */}
          <View style={s.heartsCard}>
            <View style={s.heartsRow}>
              {Array.from({ length: info?.maxHearts ?? 5 }).map((_, i) => (
                <Text key={i} style={{ fontSize: 26, opacity: i < (info?.hearts ?? 5) ? 1 : 0.18 }}>❤️</Text>
              ))}
            </View>
            <Text style={s.heartsTxt}>
              {info?.hearts ?? 5} / {info?.maxHearts ?? 5} Kalp
            </Text>
            {(info?.hearts ?? 5) < (info?.maxHearts ?? 5) && info?.nextHeartMinutes && (
              <Text style={s.heartsRegen}>
                ⏳ {info.nextHeartMinutes} dk sonra +1 kalp
              </Text>
            )}
            {(info?.hearts ?? 5) === 0 && (
              <TouchableOpacity
                style={s.refillBtn}
                onPress={() => router.push('/shop' as any)}
              >
                <Text style={s.refillTxt}>📺 Reklam İzle / Coin Harca</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 2X ve 1X butonları — eşit boyut yan yana */}
          <View style={s.playRow}>
            {/* 2X */}
            <Animated.View style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[s.playBtn, { backgroundColor: info?.category.color ?? PURP }]}
                onPress={() => handlePlay()}
                activeOpacity={0.85}
              >
                <View style={s.playBtnBadge}>
                  <Text style={s.playBtnBadgeTxt}>⭐ 2X PUAN</Text>
                </View>
                <Text style={s.playBtnTxt}>▶  {info?.category.name ?? 'Oyna'}</Text>
                <Text style={s.playBtnSub}>Haftanın kategorisi</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 1X */}
            <TouchableOpacity
              style={[s.oneXBtn, { flex: 1 }]}
              onPress={() => setShowCatModal(true)}
              activeOpacity={0.85}
            >
              <Text style={s.oneXHorse}>🐎</Text>
              <View style={s.oneXBadge}>
                <Text style={s.oneXBadgeTxt}>1X</Text>
              </View>
              <Text style={s.oneXTitle}>Kategori Seç</Text>
              <Text style={s.oneXSub}>Normal puan</Text>
            </TouchableOpacity>
          </View>

          {/* Kategori seçim modal */}
          <Modal visible={showCatModal} transparent animationType="slide">
            <View style={s.modalOverlay}>
              <View style={s.modalSheet}>
                {/* Modal başlık */}
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>🐎 Kategori Seç</Text>
                  <View style={s.modalBadge}>
                    <Text style={s.modalBadgeTxt}>1X PUAN</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowCatModal(false)} style={s.modalClose}>
                    <Text style={s.modalCloseTxt}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Kategoriler */}
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={s.modalGrid}>
                    {CATEGORIES
                      .filter(c => c.id !== info?.category.id)
                      .map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[s.modalCatCard, { borderColor: cat.color + '55' }]}
                          onPress={() => { setShowCatModal(false); handlePlay(cat.id); }}
                          activeOpacity={0.8}
                        >
                          <View style={[s.modalCatIcon, { backgroundColor: cat.color + '22' }]}>
                            <Text style={{ fontSize: 26 }}>{cat.icon}</Text>
                          </View>
                          <Text style={s.modalCatName}>{cat.shortName}</Text>
                          <Text style={[s.modalCatCount, { color: cat.color }]}>{cat.questionCount}+</Text>
                        </TouchableOpacity>
                      ))
                    }
                  </View>
                  <View style={{ height: 24 }} />
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Lig terfi bilgisi */}
          <View style={s.promotionCard}>
            <Text style={s.promotionTxt}>
              🏆 İlk 5 kişi <Text style={{ color: GOLD }}>yükseliyor</Text>
              {'  '}💔 Son 5 kişi <Text style={{ color: RED }}>düşüyor</Text>
            </Text>
          </View>

          {/* Liderlik tablosu */}
          <Text style={s.lbTitle}>Ligin Sıralaması</Text>

          {leaderboard.map((entry: any, i: number) => {
            const isMe  = entry.username === user.username;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            const isTop5  = i < 5;
            const isBot5  = leaderboard.length >= 10 && i >= leaderboard.length - 5;
            return (
              <View key={i} style={[
                s.lbRow,
                isMe    && s.lbRowMe,
                isTop5  && !isMe && s.lbRowTop,
                isBot5  && !isMe && s.lbRowBot,
              ]}>
                <View style={s.rankWrap}>
                  {medal ? <Text style={{ fontSize: 18 }}>{medal}</Text>
                         : <Text style={s.rankTxt}>#{i + 1}</Text>}
                </View>
                <Avatar avatarId={entry.avatar_id} size={34} />
                <Text style={[s.lbName, isMe && { color: PURP2 }]} numberOfLines={1}>
                  {entry.username}{isMe ? ' (sen)' : ''}
                </Text>
                <Text style={[s.lbScore, i < 3 && { color: GOLD }]}>
                  {(entry.weekly_score ?? 0).toLocaleString('tr-TR')}
                </Text>
                {isTop5 && <Text style={s.upArrow}>↑</Text>}
                {isBot5 && <Text style={s.downArrow}>↓</Text>}
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  backBtn:       { width: 60 },
  backTxt:       { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },
  headerTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },
  leagueBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  leagueBadgeTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 12 },

  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:   { paddingBottom: 32 },

  weekCard:   { margin: 16, borderRadius: 20, borderWidth: 1.5, backgroundColor: CARD, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  weekIconBg: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  weekInfo:   { flex: 1, gap: 4 },
  weekBadge:  { backgroundColor: PURP + '30', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  weekBadgeTxt: { fontFamily: 'Nunito-Bold', fontSize: 9, color: PURP2, letterSpacing: 0.8 },
  weekCatName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },
  weekCountRow: { flexDirection: 'row', alignItems: 'center' },
  weekCountLabel: { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  weekCountVal:   { fontFamily: 'Nunito-ExtraBold', fontSize: 13 },

  statsRow:    { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: BORDER },
  statBox:     { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statBoxMid:  { borderLeftWidth: 1, borderRightWidth: 1, borderColor: BORDER },
  statNum:     { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT },
  statLabel:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, marginTop: 2 },

  heartsCard:  { marginHorizontal: 16, marginBottom: 14, backgroundColor: '#1a0a2e', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#6c3aed44', alignItems: 'center', gap: 8 },
  heartsRow:   { flexDirection: 'row', gap: 6 },
  heartsTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  heartsRegen: { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  refillBtn:   { backgroundColor: GOLD + '22', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: GOLD + '55', marginTop: 4 },
  refillTxt:   { fontFamily: 'Nunito-Bold', fontSize: 13, color: GOLD },

  // Butonlar yan yana
  playRow:  { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 10 },

  playBtn:      { borderRadius: 18, paddingVertical: 16, alignItems: 'center', gap: 4,
                  shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  playBtnBadge: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  playBtnBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: GOLD, letterSpacing: 0.5 },
  playBtnTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#fff' },
  playBtnSub:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // 1X butonu
  oneXBtn:   { flex: 1, backgroundColor: '#1a1040', borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 2, borderColor: '#6c3aed66' },
  oneXHorse: { fontSize: 32 },
  oneXBadge: { backgroundColor: '#6c3aed33', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#8b5cf655' },
  oneXBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: '#a78bfa', letterSpacing: 1 },
  oneXTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  oneXSub:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: '#13132a', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%', paddingBottom: 20 },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#2e2b5a', gap: 10 },
  modalTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT, flex: 1 },
  modalBadge:   { backgroundColor: '#6c3aed33', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#8b5cf655' },
  modalBadgeTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: '#a78bfa', letterSpacing: 0.5 },
  modalClose:   { backgroundColor: '#ffffff15', borderRadius: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: MUTED },
  modalGrid:    { flexDirection: 'row', flexWrap: 'wrap', padding: 14, gap: 10 },
  modalCatCard: { width: CAT_CARD_W, backgroundColor: '#0d0d1a', borderRadius: 16, padding: 12, alignItems: 'center', gap: 5, borderWidth: 1.5 },
  modalCatIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalCatName: { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: TEXT, textAlign: 'center' },
  modalCatCount:{ fontFamily: 'Nunito-Regular', fontSize: 10, textAlign: 'center' },

  promotionCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: CARD, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  promotionTxt:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },

  lbTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT, paddingHorizontal: 16, marginBottom: 10 },
  lbRow:   { marginHorizontal: 16, marginBottom: 6, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  lbRowMe:  { borderColor: PURP2, backgroundColor: PURP + '18' },
  lbRowTop: { borderColor: GREEN + '55' },
  lbRowBot: { borderColor: RED + '44' },
  rankWrap: { width: 32, alignItems: 'center' },
  rankTxt:  { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED },
  lbName:   { flex: 1, fontFamily: 'Nunito-SemiBold', fontSize: 14, color: TEXT },
  lbScore:  { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  upArrow:  { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: GREEN },
  downArrow:{ fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: RED },
});
