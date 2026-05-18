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
const GOLD  = '#f59e0b';
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

const TABLES = [
  { stake: 50,   label: 'Başlangıç', color: '#22c55e', desc: '50 🪙 kazanabilirsin' },
  { stake: 200,  label: 'Orta',      color: '#f59e0b', desc: '200 🪙 kazanabilirsin' },
  { stake: 500,  label: 'Yüksek',    color: '#ef4444', desc: '500 🪙 kazanabilirsin' },
  { stake: 2000, label: 'VIP',       color: '#a78bfa', desc: '2000 🪙 kazanabilirsin' },
];

interface Friend { id: string; username: string; avatarId: number; level: number; }

export default function DuelLobbyScreen() {
  const { user } = useUserStore();
  const [friends,         setFriends]         = useState<Friend[]>([]);
  const [selectedFriend,  setSelectedFriend]  = useState<Friend | null>(null);
  const [selectedStake,   setSelectedStake]   = useState(50);
  const [loading,         setLoading]         = useState(true);
  const [waiting,         setWaiting]         = useState(false);

  const duelRank = (user as any)?.duelRank ?? 0;
  const rank     = getRank(duelRank);

  useEffect(() => {
    loadFriends();
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on('duel_accepted', (data: { duelId: string; stake: number }) => {
      setWaiting(false);
      router.replace(`/duel/${data.duelId}?stake=${data.stake ?? selectedStake}` as any);
    });

    socket.on('duel_rejected', () => {
      setWaiting(false);
      Alert.alert('Reddedildi', 'Arkadaşın düello davetini reddetti.');
    });

    socket.on('mm_matched', (data: { duelId: string; stake: number; opponent: any }) => {
      socket.off('mm_matched');
      router.replace(
        `/duel/matchmaking?duelId=${data.duelId}&stake=${data.stake}&oppName=${data.opponent.username}&oppAvatar=${data.opponent.avatarId}&oppRank=${data.opponent.duelRank}` as any
      );
    });

    socket.on('duel_cancelled', ({ reason }: { reason: string }) => {
      Alert.alert('İptal', reason);
    });

    return () => {
      socket.off('duel_accepted');
      socket.off('duel_rejected');
      socket.off('mm_matched');
      socket.off('duel_cancelled');
    };
  }, [selectedStake]);

  const loadFriends = async () => {
    try {
      const res = await api.get('/social/friends');
      setFriends(res.data ?? []);
    } catch { setFriends([]); }
    finally   { setLoading(false); }
  };

  const sendChallenge = () => {
    if (!user?.emailVerified) {
      Alert.alert('E-posta Doğrulanmamış', 'Düello için e-postanı doğrulaman gerekiyor.');
      return;
    }
    if (!selectedFriend) { Alert.alert('Arkadaş Seç', 'Bir arkadaş seç!'); return; }
    if ((user.coins ?? 0) < selectedStake) {
      Alert.alert('Yetersiz Coin', `Bu masa için ${selectedStake} 🪙 gerekiyor.`); return;
    }
    const socket = socketService.getSocket();
    if (!socket) { Alert.alert('Bağlantı yok'); return; }
    const duelId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    socket.emit('duel_invite', { targetId: selectedFriend.id, stake: selectedStake, duelId });
    setWaiting(true);
  };

  const findRandom = () => {
    if ((user?.coins ?? 0) < selectedStake) {
      Alert.alert('Yetersiz Coin', `Bu masa için ${selectedStake} 🪙 gerekiyor.`); return;
    }
    router.push(`/duel/matchmaking?stake=${selectedStake}` as any);
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>⚔️ Düello</Text>
        <View style={[s.rankBadge, { borderColor: rank.color + '88' }]}>
          <Text style={{ fontSize: 14 }}>{rank.icon}</Text>
          <Text style={[s.rankTxt, { color: rank.color }]}>{duelRank}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Rank kartı */}
        <View style={s.rankCard}>
          <View style={s.rankLeft}>
            <Text style={{ fontSize: 32 }}>{rank.icon}</Text>
            <View>
              <Text style={[s.rankName, { color: rank.color }]}>{rank.label}</Text>
              <Text style={s.rankPts}>{duelRank} puan</Text>
            </View>
          </View>
          <View style={s.coinsBox}>
            <Text style={s.coinsNum}>🪙 {(user?.coins ?? 0).toLocaleString('tr-TR')}</Text>
            <Text style={s.coinsLabel}>Mevcut Bakiye</Text>
          </View>
        </View>

        {/* Çark açıklaması */}
        <View style={s.wheelInfo}>
          <Text style={s.wheelInfoTxt}>⭕ Çark kategoriyi belirler · 3 tur · En çok tur kazanan alır</Text>
        </View>

        {/* Masa seçimi */}
        <Text style={s.label}>Masa Seç</Text>
        <View style={s.tablesGrid}>
          {TABLES.map(t => (
            <TouchableOpacity
              key={t.stake}
              style={[s.tableCard, t.stake === selectedStake && { borderColor: t.color, backgroundColor: t.color + '18' }]}
              onPress={() => setSelectedStake(t.stake)}
              activeOpacity={0.8}
            >
              <Text style={[s.tableStake, { color: t.stake === selectedStake ? t.color : TEXT }]}>
                {t.stake.toLocaleString('tr-TR')} 🪙
              </Text>
              <Text style={[s.tableLabel, { color: t.stake === selectedStake ? t.color : MUTED }]}>{t.label}</Text>
              {t.stake === selectedStake && (
                <View style={[s.tableSelected, { backgroundColor: t.color }]}>
                  <Text style={s.tableSelectedTxt}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* İki buton */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.randomBtn} onPress={findRandom} activeOpacity={0.85}>
            <Text style={s.randomIcon}>🎲</Text>
            <Text style={s.randomTitle}>Rastgele Rakip</Text>
            <Text style={s.randomSub}>Hızlı eşleşme</Text>
          </TouchableOpacity>

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

        {/* Arkadaş listesi */}
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

  rankCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: CARD, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: BORDER },
  rankLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankName: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  rankPts:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  coinsBox: { alignItems: 'flex-end' },
  coinsNum: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: GOLD },
  coinsLabel: { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED },

  wheelInfo:    { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#6c3aed18', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#6c3aed44', alignItems: 'center' },
  wheelInfoTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: PURP2, textAlign: 'center' },

  label: { fontFamily: 'Nunito-Bold', fontSize: 13, color: MUTED, paddingHorizontal: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  tablesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 20 },
  tableCard:  { width: '47%', backgroundColor: CARD, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: BORDER, gap: 4 },
  tableStake: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  tableLabel: { fontFamily: 'Nunito-Regular', fontSize: 12 },
  tableSelected:    { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tableSelectedTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: '#fff' },

  actionRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  randomBtn: { flex: 1, backgroundColor: PURP, borderRadius: 18, padding: 18, alignItems: 'center', gap: 4,
               shadowColor: PURP2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
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
