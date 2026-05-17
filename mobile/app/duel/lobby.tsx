import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { socketService } from '../../src/services/socket.service';
import { Avatar } from '../../src/components/ui/Avatar';
import api from '../../src/services/api';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const BORDER= '#2e2b5a';

const RANKS = [
  { min: 0,    label: 'Bronz',   icon: '🥉', color: '#cd7f32' },
  { min: 500,  label: 'Gümüş',  icon: '🥈', color: '#9ca3af' },
  { min: 1000, label: 'Altın',   icon: '🥇', color: '#f59e0b' },
  { min: 1500, label: 'Elmas',   icon: '💎', color: '#06b6d4' },
  { min: 2000, label: 'Efsane', icon: '👑', color: '#a78bfa' },
];

export function getRank(pts: number) {
  return [...RANKS].reverse().find(r => pts >= r.min) ?? RANKS[0];
}

const CATS = [
  { id: 'general',   label: 'Genel',    icon: '💡' },
  { id: 'history',   label: 'Tarih',    icon: '🏺' },
  { id: 'science',   label: 'Bilim',    icon: '🔬' },
  { id: 'sports',    label: 'Spor',     icon: '⚽' },
  { id: 'cinema',    label: 'Sinema',   icon: '🎬' },
  { id: 'geography', label: 'Coğrafya', icon: '🌍' },
];

interface Friend { id: string; username: string; avatarId: number; level: number; }

export default function DuelLobbyScreen() {
  const { user } = useUserStore();
  const [friends,      setFriends]      = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedCat,  setSelectedCat]  = useState(CATS[0].id);
  const [loading,      setLoading]      = useState(true);
  const [waiting,      setWaiting]      = useState(false);

  const duelRank  = (user as any)?.duelRank ?? 0;
  const rank      = getRank(duelRank);

  useEffect(() => {
    loadFriends();
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.on('duel_accepted', (data: { duelId: string; category?: string }) => {
      setWaiting(false);
      router.replace(`/duel/${data.duelId}?cat=${data.category ?? selectedCat}` as any);
    });
    socket.on('duel_rejected', () => {
      setWaiting(false);
      Alert.alert('Reddedildi', 'Arkadaşın düello davetini reddetti.');
    });
    // Rastgele eşleşme bulundu
    socket.on('mm_matched', (data: { duelId: string; category: string; opponent: any }) => {
      socket.off('mm_matched');
      router.replace(`/duel/matchmaking?duelId=${data.duelId}&cat=${data.category}&oppName=${data.opponent.username}&oppAvatar=${data.opponent.avatarId}&oppRank=${data.opponent.duelRank}` as any);
    });
    return () => {
      socket.off('duel_accepted');
      socket.off('duel_rejected');
      socket.off('mm_matched');
    };
  }, [selectedCat]);

  const loadFriends = async () => {
    try {
      const res = await api.get('/social/friends');
      setFriends(res.data ?? []);
    } catch { setFriends([]); }
    finally   { setLoading(false); }
  };

  const sendChallenge = () => {
    if (!user?.emailVerified) {
      Alert.alert('E-posta Doğrulanmamış', 'Düello için e-postanı doğrulaman gerekiyor.', [
        { text: 'Kapat', style: 'cancel' },
        { text: 'Doğrula', onPress: () => router.push({ pathname: '/(auth)/verify-email', params: { email: user?.email } } as any) },
      ]);
      return;
    }
    if (!selectedFriend) { Alert.alert('Arkadaş Seç', 'Düello için bir arkadaş seç!'); return; }
    const socket = socketService.getSocket();
    if (!socket) { Alert.alert('Bağlantı yok'); return; }
    const duelId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    socket.emit('duel_invite', { friendId: selectedFriend.id, mode: selectedCat, duelId });
    setWaiting(true);
  };

  const findRandom = () => {
    // mm_join'i matchmaking ekranı emit edecek — burada sadece yönlendir
    router.push(`/duel/matchmaking?cat=${selectedCat}` as any);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>⚔️ Düello</Text>
        {/* Rank badge */}
        <View style={[s.rankBadge, { borderColor: rank.color + '88' }]}>
          <Text style={{ fontSize: 14 }}>{rank.icon}</Text>
          <Text style={[s.rankTxt, { color: rank.color }]}>{duelRank}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rank ve Seri */}
        <View style={s.rankCard}>
          <View style={s.rankLeft}>
            <Text style={{ fontSize: 32 }}>{rank.icon}</Text>
            <View>
              <Text style={[s.rankName, { color: rank.color }]}>{rank.label}</Text>
              <Text style={s.rankPts}>{duelRank} puan</Text>
            </View>
          </View>
          <View style={s.streakBox}>
            <Text style={s.streakNum}>🔥 {(user as any)?.duelStreak ?? 0}</Text>
            <Text style={s.streakLabel}>Galibiyet Serisi</Text>
          </View>
        </View>

        {/* Kategori seçimi */}
        <Text style={s.label}>Kategori Seç</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={s.catRow}>
            {CATS.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.catChip, c.id === selectedCat && s.catChipActive]}
                onPress={() => setSelectedCat(c.id)}
              >
                <Text style={{ fontSize: 16 }}>{c.icon}</Text>
                <Text style={[s.catLabel, c.id === selectedCat && { color: TEXT }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ── İki büyük buton ── */}
        <View style={s.actionRow}>
          {/* Rastgele Rakip */}
          <TouchableOpacity style={s.randomBtn} onPress={findRandom} activeOpacity={0.85}>
            <Text style={s.randomIcon}>🎲</Text>
            <Text style={s.randomTitle}>Rastgele Rakip</Text>
            <Text style={s.randomSub}>Hızlı eşleşme</Text>
          </TouchableOpacity>

          {/* Arkadaşa Davet */}
          <TouchableOpacity
            style={[s.friendBtn, !selectedFriend && { opacity: 0.6 }]}
            onPress={sendChallenge}
            disabled={waiting}
            activeOpacity={0.85}
          >
            {waiting
              ? <ActivityIndicator color={TEXT} />
              : <>
                  <Text style={s.randomIcon}>👥</Text>
                  <Text style={s.randomTitle}>Arkadaşa Davet</Text>
                  <Text style={s.randomSub}>{selectedFriend ? selectedFriend.username : 'Birini seç'}</Text>
                </>
            }
          </TouchableOpacity>
        </View>

        {/* Arkadaş Listesi */}
        <Text style={s.label}>Arkadaşlar</Text>
        {loading
          ? <ActivityIndicator color={PURP2} style={{ marginTop: 20 }} />
          : friends.length === 0
          ? <View style={s.emptyBox}>
              <Text style={{ fontSize: 36 }}>👥</Text>
              <Text style={s.emptyTxt}>Henüz arkadaşın yok</Text>
              <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(tabs)/friends' as any)}>
                <Text style={s.addBtnTxt}>Arkadaş Ekle</Text>
              </TouchableOpacity>
            </View>
          : friends.map(f => {
              const sel = selectedFriend?.id === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[s.friendRow, sel && s.friendRowSelected]}
                  onPress={() => setSelectedFriend(sel ? null : f)}
                >
                  <Avatar avatarId={f.avatarId} size={40} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.friendName}>{f.username}</Text>
                    <Text style={s.friendLevel}>Seviye {f.level}</Text>
                  </View>
                  {sel && <Text style={{ fontSize: 20 }}>✅</Text>}
                </TouchableOpacity>
              );
            })
        }
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back:   { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },
  title:  { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  rankTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 12 },

  rankCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: CARD, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: BORDER },
  rankLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankName: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  rankPts:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  streakBox:{ alignItems: 'center' },
  streakNum:{ fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },
  streakLabel: { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED },

  label: { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED, paddingHorizontal: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  catRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: BORDER, backgroundColor: CARD },
  catChipActive: { backgroundColor: PURP + '33', borderColor: PURP2 },
  catLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED },

  actionRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  randomBtn: { flex: 1, backgroundColor: PURP, borderRadius: 18, padding: 18, alignItems: 'center', gap: 4, shadowColor: PURP2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  friendBtn: { flex: 1, backgroundColor: CARD, borderRadius: 18, padding: 18, alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: PURP2 },
  randomIcon:  { fontSize: 28 },
  randomTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT },
  randomSub:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#a78bfa' },

  friendRow:         { marginHorizontal: 16, marginBottom: 8, backgroundColor: CARD, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  friendRowSelected: { borderColor: PURP2, backgroundColor: PURP + '18' },
  friendName:  { fontFamily: 'Nunito-Bold', fontSize: 15, color: TEXT },
  friendLevel: { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginTop: 2 },
  emptyBox: { alignItems: 'center', gap: 10, padding: 32 },
  emptyTxt: { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  addBtn:   { backgroundColor: PURP, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  addBtnTxt:{ fontFamily: 'Nunito-Bold', fontSize: 14, color: TEXT },
});
