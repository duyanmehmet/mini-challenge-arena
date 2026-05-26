import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, Alert, Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const LEAGUE_ICONS: Record<string, string> = {
  filiz:'🌱',kaya:'🪨',demir:'🔩',celik:'⚔️',bronz:'🥉',
  gumus:'🥈',altin:'🥇',safir:'🔵',zumrut:'💚',elmas:'💎',
  platin:'🔷',kristal:'🌟',mistik:'🔮',ay:'🌙',gunes:'☀️',
  simsek:'⚡',alev:'🔥',okyanus:'🌊',zirve:'🏔️',kartal:'🦅',
  ejderha:'🐉',galaksi:'🌌',nova:'💫',efsane:'🦄',kral:'👑',
  yildiz:'⭐',meteor:'🌠',zafer:'🏆',elit:'🎯',sampiyon:'🏅',
};
const LEAGUE_COLORS: Record<string, string> = {
  filiz:'#86efac',kaya:'#a8a29e',demir:'#94a3b8',celik:'#64748b',bronz:'#cd7f32',
  gumus:'#9ca3af',altin:'#f59e0b',safir:'#3b82f6',zumrut:'#22c55e',elmas:'#06b6d4',
  platin:'#38bdf8',kristal:'#e2e8f0',mistik:'#a855f7',ay:'#c4b5fd',gunes:'#fbbf24',
  simsek:'#facc15',alev:'#f97316',okyanus:'#0ea5e9',zirve:'#e2e8f0',kartal:'#854d0e',
  ejderha:'#dc2626',galaksi:'#6366f1',nova:'#f0abfc',efsane:'#e879f9',kral:'#fde047',
  yildiz:'#fef08a',meteor:'#fb923c',zafer:'#f59e0b',elit:'#f43f5e',sampiyon:'#a78bfa',
};
const LEAGUE_NAMES: Record<string, string> = {
  filiz:'Filiz',kaya:'Kaya',demir:'Demir',celik:'Çelik',bronz:'Bronz',
  gumus:'Gümüş',altin:'Altın',safir:'Safir',zumrut:'Zümrüt',elmas:'Elmas',
  platin:'Platin',kristal:'Kristal',mistik:'Mistik',ay:'Ay',gunes:'Güneş',
  simsek:'Şimşek',alev:'Alev',okyanus:'Okyanus',zirve:'Zirve',kartal:'Kartal',
  ejderha:'Ejderha',galaksi:'Galaksi',nova:'Nova',efsane:'Efsane',kral:'Kral',
  yildiz:'Yıldız',meteor:'Meteor',zafer:'Zafer',elit:'Elit',sampiyon:'Şampiyon',
};

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

interface LigPlayer {
  id: string;
  username: string;
  avatar_id: number;
  weekly_score: number;
  level: number;
}

function useCountdown(targetIso: string) {
  const [text, setText] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setText('Bitti'); return; }
      const totalHours = diff / 3600000;
      if (totalHours >= 24) {
        // 1 günden fazla → gün göster
        const days = Math.ceil(totalHours / 24);
        setText(`${days} gün kaldı`);
      } else {
        // 1 günden az → saat:dakika:saniye
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (h > 0) setText(`${h}s ${m}dk ${s}sn`);
        else setText(`${m}dk ${s}sn`);
      }
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
  const [leaderboard, setLeaderboard] = useState<LigPlayer[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

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
    setError(null);
    try {
      const [currentRes, lbRes] = await Promise.all([
        api.get('/lig/current'),
        api.get('/lig/leaderboard'),
      ]);
      setInfo(currentRes.data);
      setLeaderboard(lbRes.data ?? []);
    } catch (err: any) {
      const msg: string =
        err?.userMessage ??
        err?.response?.data?.message ??
        err?.message ??
        'Sunucuya bağlanılamadı.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (categoryId?: string) => {
    const catId = categoryId ?? info?.category.id;
    if (!catId) return;
    if ((info?.hearts ?? 5) <= 0) {
      Alert.alert(
        '❤️ Kalplerin Bitti',
        'Oynamak için kalp gerekli.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: '250 🪙 ile Doldur', onPress: handleRefillHearts },
        ]
      );
      return;
    }
    router.push({
      pathname: `/game/${catId}` as any,
      params: { ligMode: '1' },
    });
  };

  const handleRefillHearts = async () => {
    if ((user?.coins ?? 0) < 250) {
      Alert.alert('Yetersiz Altın', '5 kalbi doldurmak için 250 🪙 gerekli.');
      return;
    }
    try {
      const res = await api.post('/lig/refill-hearts');
      setInfo(prev => prev ? { ...prev, hearts: res.data.hearts } : prev);
      Alert.alert('✅ Kalplerin Doldu!', '5 kalbin yenilendi.');
    } catch (e: any) {
      Alert.alert('Hata', e?.response?.data?.message ?? 'İşlem başarısız.');
    }
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
          <View style={s.backBtnInner}>
            <Text style={s.backTxt}>←  Geri</Text>
          </View>
        </TouchableOpacity>
        <View style={s.headerTitleRow}>
          <Text style={{ fontSize: 20 }}>🏟️</Text>
          <Text style={s.headerTitle}>Lig</Text>
        </View>

        {/* Sağ: Lig rozeti + Canlar */}
        <View style={s.headerRight}>
          <View style={[s.leagueBadge, { borderColor: leagueColor + '80' }]}>
            <Text>{leagueIcon}</Text>
            <Text style={[s.leagueBadgeTxt, { color: leagueColor }]}>{leagueName}</Text>
          </View>
          {/* Kompakt kalp göstergesi */}
          <View style={s.heartsHeader}>
            {Array.from({ length: info?.maxHearts ?? 5 }).map((_, i) => (
              <Text key={i} style={{ fontSize: 14, opacity: i < (info?.hearts ?? 5) ? 1 : 0.2 }}>❤️</Text>
            ))}
          </View>
        </View>
      </View>

      {loading ? (
        <View style={s.loadWrap}>
          <ActivityIndicator color={PURP2} size="large" />
        </View>
      ) : error ? (
        <View style={s.loadWrap}>
          <Text style={s.errorIcon}>⚠️</Text>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={loadData}>
            <Text style={s.retryBtnTxt}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Hafta kartı */}
          {info && (
            <LinearGradient
              colors={[info.category.color + 'cc', info.category.color + '44', '#13132a']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.weekCard}
            >
              <View style={[s.weekIconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={{ fontSize: 42 }}>{info.category.icon}</Text>
              </View>
              <View style={s.weekInfo}>
                <View style={s.weekBadge}>
                  <Text style={s.weekBadgeTxt}>BU HAFTA</Text>
                </View>
                <Text style={s.weekCatName}>{info.category.name}</Text>
                <View style={s.weekCountRow}>
                  <Text style={s.weekCountLabel}>⏳ Bitiş: </Text>
                  <Text style={[s.weekCountVal, { color: '#fde047' }]}>{countdown}</Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Can dolu değilse küçük uyarı */}
          {info && (info.hearts ?? 5) < (info.maxHearts ?? 5) && (
            <View style={s.heartWarn}>
              <Text style={s.heartWarnTxt}>
                {(info.hearts ?? 0) === 0
                  ? '🖤 Kalplerin bitti!'
                  : `❤️ ${info.hearts}/${info.maxHearts} kalp`}
                {info.nextHeartMinutes
                  ? `  ·  ⏳ ${info.nextHeartMinutes} dk sonra +1`
                  : ''}
              </Text>
              <TouchableOpacity onPress={handleRefillHearts} style={s.refillBtn}>
                <Text style={s.refillBtnTxt}>❤️ 5 Kalp  250 🪙</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 2X ve 1X butonları — eşit boyut yan yana */}
          <View style={s.playRow}>
            {/* 2X */}
            <Animated.View style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity onPress={() => handlePlay()} activeOpacity={0.85} style={{ borderRadius: 18, overflow: 'hidden' }}>
                <LinearGradient
                  colors={[info?.category.color ?? PURP, '#4c1d95', '#2e1065']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.playBtn}
                >
                  <View style={s.playBtnBadge}>
                    <Text style={s.playBtnBadgeTxt}>⭐ 2X PUAN</Text>
                  </View>
                  <Text style={s.playBtnTxt}>▶  {info?.category.name ?? 'Oyna'}</Text>
                  <Text style={s.playBtnSub}>Haftanın kategorisi</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* 1X — 2X ile aynı boyut ve şekil */}
            <Animated.View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => setShowCatModal(true)} activeOpacity={0.85} style={{ borderRadius: 18, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['#6d28d9', '#4c1d95', '#2e1065']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.playBtn}
                >
                  <View style={s.playBtnBadge}>
                    <Text style={s.playBtnBadgeTxt}>🐎 1X PUAN</Text>
                  </View>
                  <Text style={s.playBtnTxt}>Kategori Seç</Text>
                  <Text style={s.playBtnSub}>Normal puan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
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
                        </TouchableOpacity>
                      ))
                    }
                  </View>
                  <View style={{ height: 24 }} />
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Kullanıcı skoru ve sırası */}
          {info && (
            <View style={s.myScoreCard}>
              <View style={s.myScoreLeft}>
                <Text style={s.myScoreRank}>#{info.userRank}</Text>
                <Text style={s.myScoreLabel}>Sıran</Text>
              </View>
              <View style={s.myScoreDivider} />
              <View style={s.myScoreCenter}>
                <Text style={s.myScoreVal}>{info.userScore.toLocaleString('tr-TR')}</Text>
                <Text style={s.myScoreLabel}>Haftalık Puan</Text>
              </View>
              <View style={s.myScoreDivider} />
              <View style={s.myScoreRight}>
                <Text style={s.myScoreRank}>{info.leagueCount}</Text>
                <Text style={s.myScoreLabel}>Oyuncu</Text>
              </View>
            </View>
          )}

          {/* Sıralama Listesi */}
          {leaderboard.length > 0 && (
            <View style={s.lbSection}>
              <Text style={s.lbTitle}>🏅 Lig Sıralaması</Text>
              {leaderboard.map((player, index) => {
                const isMe = player.id === user?.id;
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                return (
                  <View key={player.id} style={[s.lbRow, isMe && s.lbRowMe]}>
                    <Text style={s.lbPos}>{medal ?? `${index + 1}`}</Text>
                    <View style={s.lbAvatarWrap}>
                      <Text style={s.lbAvatarTxt}>👤</Text>
                    </View>
                    <View style={s.lbInfo}>
                      <Text style={[s.lbName, isMe && { color: PURP }]} numberOfLines={1}>
                        {player.username}{isMe ? ' (Sen)' : ''}
                      </Text>
                      <Text style={s.lbLevel}>Seviye {player.level}</Text>
                    </View>
                    <Text style={[s.lbScore, isMe && { color: PURP }]}>
                      {player.weekly_score.toLocaleString('tr-TR')}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  backBtn:       { },
  backBtnInner:  { backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  backTxt:       { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  headerTitleRow:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 8 },
  headerTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#111827' },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leagueBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#fff' },
  leagueBadgeTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 11 },
  heartsHeader:  { flexDirection: 'row', gap: 1 },

  // Can uyarı bandı
  heartWarn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 10, backgroundColor: '#fff1f2', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#fecdd3' },
  heartWarnTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#ef4444', flex: 1 },
  heartWarnBtn: { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#f59e0b' },
  refillBtn:    { backgroundColor: '#fef3c7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#fde68a' },
  refillBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: '#d97706' },

  loadWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', gap: 12, padding: 32 },
  errorIcon:  { fontSize: 40 },
  errorText:  { fontFamily: 'Nunito-Bold', fontSize: 15, color: RED, textAlign: 'center' },
  retryBtn:   { backgroundColor: PURP, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#fff' },
  scroll:   { paddingBottom: 32, backgroundColor: '#fff' },

  weekCard:   { margin: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, overflow: 'hidden' },
  weekIconBg: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  weekInfo:   { flex: 1, gap: 4 },
  weekBadge:  { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  weekBadgeTxt: { fontFamily: 'Nunito-Bold', fontSize: 9, color: '#fff', letterSpacing: 0.8 },
  weekCatName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#fff' },
  weekCountRow: { flexDirection: 'row', alignItems: 'center' },
  weekCountLabel: { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  weekCountVal:   { fontFamily: 'Nunito-ExtraBold', fontSize: 13 },


  // Butonlar yan yana
  playRow:  { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 10 },

  playBtn:      { paddingVertical: 18, alignItems: 'center', gap: 4,
                  shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 10 },
  playBtnBadge: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  playBtnBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: GOLD, letterSpacing: 0.5 },
  playBtnTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#fff' },
  playBtnSub:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // 1X butonu
  oneXBtn:   { flex: 1, backgroundColor: '#fff', borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 2, borderColor: '#6c3aed44' },
  oneXHorse: { fontSize: 32 },
  oneXBadge: { backgroundColor: '#ede9fe', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#c4b5fd' },
  oneXBadgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: '#7c3aed', letterSpacing: 1 },
  oneXTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#111827' },
  oneXSub:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#9ca3af' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%', paddingBottom: 20 },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 10 },
  modalTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827', flex: 1 },
  modalBadge:   { backgroundColor: '#ede9fe', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#c4b5fd' },
  modalBadgeTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: '#7c3aed', letterSpacing: 0.5 },
  modalClose:   { backgroundColor: '#f3f4f6', borderRadius: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#6b7280' },
  modalGrid:    { flexDirection: 'row', flexWrap: 'wrap', padding: 14, gap: 10 },
  modalCatCard: { width: CAT_CARD_W, backgroundColor: '#f9fafb', borderRadius: 16, padding: 12, alignItems: 'center', gap: 5, borderWidth: 1.5 },
  modalCatIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalCatName: { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: '#111827', textAlign: 'center' },
  modalCatCount:{ fontFamily: 'Nunito-Regular', fontSize: 10, textAlign: 'center' },

  promotionCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#f9fafb', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  promotionTxt:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#6b7280' },

  // Kullanıcı skoru kartı
  myScoreCard:    { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#f5f3ff', borderRadius: 18, flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#ede9fe' },
  myScoreLeft:    { flex: 1, alignItems: 'center' },
  myScoreCenter:  { flex: 1.4, alignItems: 'center' },
  myScoreRight:   { flex: 1, alignItems: 'center' },
  myScoreDivider: { width: 1, height: 36, backgroundColor: '#ddd6fe' },
  myScoreRank:    { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: PURP },
  myScoreVal:     { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: PURP },
  myScoreLabel:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#9ca3af', marginTop: 2 },

  // Liderlik tablosu
  lbSection: { marginHorizontal: 16, marginBottom: 10 },
  lbTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#111827', marginBottom: 10 },
  lbRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: '#f3f4f6' },
  lbRowMe:   { borderColor: PURP + '66', backgroundColor: '#f5f3ff' },
  lbPos:     { fontFamily: 'Nunito-ExtraBold', fontSize: 16, width: 32, textAlign: 'center', color: '#374151' },
  lbAvatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  lbAvatarTxt:  { fontSize: 18 },
  lbInfo:    { flex: 1 },
  lbName:    { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#111827' },
  lbLevel:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#9ca3af' },
  lbScore:   { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#374151' },
});
