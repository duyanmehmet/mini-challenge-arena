import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { CATEGORIES } from '../src/constants/categories';
import { Avatar } from '../src/components/ui/Avatar';
import api from '../src/services/api';
import { HowToPlayModal, useHowToPlay } from '../src/components/ui/HowToPlayModal';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GOLD  = '#f59e0b';
const GREEN = '#10b981';
const BORDER= '#2e2b5a';

export default function ChallengeScreen() {
  const { user } = useUserStore();
  const howTo = useHowToPlay('challenge');
  const [challenge, setChallenge]   = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myScore, setMyScore]       = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/challenge/today'),
      api.get('/challenge/leaderboard'),
    ]).then(([c, lb]) => {
      setChallenge(c.data);
      setLeaderboard(lb.data);
      const mine = lb.data.find((e: any) => e.username === user?.username);
      if (mine) setMyScore(mine.score);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const modeCfg = challenge ? CATEGORIES.find(m => m.id === challenge.mode) : null;
  const today   = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });

  return (
    <SafeAreaView style={s.root}>
      <HowToPlayModal mode="challenge" visible={howTo.visible} onClose={howTo.hide} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Bugünün Meydanı</Text>
          <Text style={s.headerDate}>{today}</Text>
        </View>
        <TouchableOpacity style={s.helpBtn} onPress={howTo.show}>
          <Text style={s.helpTxt}>?</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator color={PURP2} size="large" />
          <Text style={s.loadingTxt}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Kategori Kartı */}
          {modeCfg && (
            <View style={[s.modeCard, { borderColor: modeCfg.color + '60' }]}>
              <View style={[s.modeIconBg, { backgroundColor: modeCfg.color + '20' }]}>
                <Text style={{ fontSize: 44 }}>{modeCfg.icon}</Text>
              </View>
              <View style={s.modeInfo}>
                <View style={s.modeBadge}>
                  <Text style={s.modeBadgeTxt}>GÜNÜN KATEGORİSİ</Text>
                </View>
                <Text style={s.modeName}>{modeCfg.name}</Text>
                <Text style={s.modeDesc}>{modeCfg.description}</Text>
                <View style={s.targetRow}>
                  <Text style={s.targetTxt}>🎯 Hedef: </Text>
                  <Text style={[s.targetScore, { color: modeCfg.color }]}>
                    {challenge?.target_score?.toLocaleString('tr-TR')} puan
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Oyna / Tamamlandı */}
          {myScore !== null ? (
            <View style={s.doneCard}>
              <Text style={s.doneIcon}>✅</Text>
              <View>
                <Text style={s.doneTxt}>Bugünü tamamladın!</Text>
                <Text style={s.doneScore}>{myScore.toLocaleString('tr-TR')} puan</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.playBtn, { backgroundColor: modeCfg?.color ?? PURP }]}
              activeOpacity={0.85}
              onPress={() => {
                if (challenge) {
                  router.push({
                    pathname: `/game/${challenge.mode}` as any,
                    params: { challengeId: challenge.id },
                  });
                }
              }}
            >
              <Text style={s.playBtnTxt}>▶  Şimdi Oyna</Text>
              <Text style={s.playBtnSub}>{modeCfg?.shortName} · {challenge?.target_score} puan hedef</Text>
            </TouchableOpacity>
          )}

          {/* XP Bilgisi */}
          <View style={s.xpRow}>
            <View style={s.xpBadge}>
              <Text style={s.xpTxt}>🏆 Hedefi geç → +100 XP</Text>
            </View>
            <View style={s.xpBadge}>
              <Text style={s.xpTxt}>✅ Oyna → +25 XP</Text>
            </View>
          </View>

          {/* Liderlik */}
          <Text style={s.lbTitle}>Bugünkü Sıralama</Text>

          {leaderboard.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>🏁</Text>
              <Text style={s.emptyTxt}>Henüz kimse oynamadı.</Text>
              <Text style={s.emptySub}>İlk sen ol ve liderliği kap!</Text>
            </View>
          ) : (
            leaderboard.slice(0, 20).map((entry: any, i: number) => {
              const isMe = entry.username === user.username;
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
              return (
                <View key={i} style={[s.lbRow, isMe && s.lbRowMe]}>
                  <View style={s.lbRankWrap}>
                    {medal
                      ? <Text style={{ fontSize: 20 }}>{medal}</Text>
                      : <Text style={s.lbRank}>#{i + 1}</Text>
                    }
                  </View>
                  <Avatar avatarId={entry.avatarId} size={34} />
                  <Text style={[s.lbName, isMe && { color: PURP2 }]} numberOfLines={1}>
                    {entry.username}{isMe ? ' (sen)' : ''}
                  </Text>
                  <Text style={[s.lbScore, i < 3 && { color: GOLD }]}>
                    {entry.score.toLocaleString('tr-TR')}
                  </Text>
                </View>
              );
            })
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  backBtn:      { },
  backTxt:      { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },
  helpBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6c3aed22', borderWidth: 1.5, borderColor: '#6c3aed55', alignItems: 'center', justifyContent: 'center' },
  helpTxt:      { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#6c3aed' },
  headerDate:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginTop: 2 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:  { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },

  scroll: { paddingBottom: 32 },

  // Kategori kartı
  modeCard:   { margin: 16, borderRadius: 20, borderWidth: 1.5, backgroundColor: CARD, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  modeIconBg: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modeInfo:   { flex: 1, gap: 4 },
  modeBadge:  { backgroundColor: PURP + '30', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  modeBadgeTxt: { fontFamily: 'Nunito-Bold', fontSize: 9, color: PURP2, letterSpacing: 0.8 },
  modeName:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },
  modeDesc:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  targetRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  targetTxt:  { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED },
  targetScore:{ fontFamily: 'Nunito-ExtraBold', fontSize: 13 },

  // Oyna
  playBtn:    { marginHorizontal: 16, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 12,
                shadowColor: PURP2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  playBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#fff' },
  playBtnSub: { fontFamily: 'Nunito-Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Tamamlandı
  doneCard:   { marginHorizontal: 16, borderRadius: 16, borderWidth: 1.5, borderColor: GREEN + '60', backgroundColor: GREEN + '12',
                flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 12 },
  doneIcon:   { fontSize: 32 },
  doneTxt:    { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: GREEN },
  doneScore:  { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED, marginTop: 2 },

  // XP
  xpRow:    { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 20 },
  xpBadge:  { flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  xpTxt:    { fontFamily: 'Nunito-Bold', fontSize: 11, color: MUTED, textAlign: 'center' },

  // Liderlik
  lbTitle:  { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT, paddingHorizontal: 16, marginBottom: 10 },
  lbRow:    { marginHorizontal: 16, marginBottom: 6, borderRadius: 14, padding: 12, flexDirection: 'row',
              alignItems: 'center', gap: 10, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  lbRowMe:  { borderColor: PURP2, backgroundColor: PURP + '18' },
  lbRankWrap:{ width: 32, alignItems: 'center' },
  lbRank:   { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED },
  lbName:   { flex: 1, fontFamily: 'Nunito-SemiBold', fontSize: 14, color: TEXT },
  lbScore:  { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },

  // Boş
  emptyWrap: { alignItems: 'center', marginTop: 32, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTxt:  { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT },
  emptySub:  { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED },
});
