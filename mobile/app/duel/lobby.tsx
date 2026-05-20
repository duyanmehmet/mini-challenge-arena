import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Alert, ScrollView,
  TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { socketService } from '../../src/services/socket.service';
import { Avatar } from '../../src/components/ui/Avatar';
import api from '../../src/services/api';

const BG    = '#ffffff';
const CARD  = '#ffffff';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const GOLD  = '#f59e0b';
const BORDER= '#f3f4f6';

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
  const [customModal,     setCustomModal]     = useState(false);
  const [customInput,     setCustomInput]     = useState('');

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
    // duelId sunucu tarafında üretiliyor, burada göndermeye gerek yok
    socket.emit('duel_invite', { targetId: selectedFriend.id, stake: selectedStake });
    setWaiting(true);
  };

  const findRandom = () => {
    if ((user?.coins ?? 0) < selectedStake) {
      Alert.alert('Yetersiz Coin', `Bu masa için ${selectedStake} 🪙 gerekiyor.`); return;
    }
    router.push(`/duel/matchmaking?stake=${selectedStake}` as any);
  };

  const confirmCustomStake = () => {
    const val = parseInt(customInput.replace(/[^0-9]/g, ''), 10);
    if (!val || val < 10) {
      Alert.alert('Geçersiz', 'En az 10 🪙 girmelisin.'); return;
    }
    if (val > (user?.coins ?? 0)) {
      Alert.alert('Yetersiz Coin', `Bakiyen: ${user?.coins ?? 0} 🪙`); return;
    }
    setSelectedStake(val);
    setCustomModal(false);
    setCustomInput('');
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

          {/* Özel Miktar kartı */}
          <TouchableOpacity
            style={[s.tableCard, s.customCard,
              !TABLES.find(t => t.stake === selectedStake) && {
                borderColor: '#8b5cf6', backgroundColor: '#f5f3ff'
              }
            ]}
            onPress={() => { setCustomInput(String(selectedStake)); setCustomModal(true); }}
            activeOpacity={0.8}
          >
            <Text style={[s.tableStake, { color: !TABLES.find(t => t.stake === selectedStake) ? '#8b5cf6' : TEXT }]}>
              {!TABLES.find(t => t.stake === selectedStake)
                ? `${selectedStake.toLocaleString('tr-TR')} 🪙`
                : '✏️ Özel'}
            </Text>
            <Text style={[s.tableLabel, { color: MUTED }]}>İstediğin kadar</Text>
          </TouchableOpacity>
        </View>

        {/* Özel Miktar Modal */}
        <Modal visible={customModal} transparent animationType="slide">
          <View style={s.customOverlay}>
            <View style={s.customSheet}>
              <Text style={s.customTitle}>Özel Masa Tutarı</Text>
              <Text style={s.customSub}>Bakiye: {(user?.coins ?? 0).toLocaleString('tr-TR')} 🪙</Text>

              <View style={s.customInputWrap}>
                <Text style={s.customInputIcon}>🪙</Text>
                <TextInput
                  style={s.customInput}
                  value={customInput}
                  onChangeText={setCustomInput}
                  keyboardType="number-pad"
                  placeholder="Tutar gir (min. 10)"
                  placeholderTextColor={MUTED}
                  maxLength={8}
                  autoFocus
                />
              </View>

              {/* Hızlı seç */}
              <View style={s.quickRow}>
                {[100, 500, 1000, 5000].map(v => (
                  <TouchableOpacity
                    key={v}
                    style={s.quickChip}
                    onPress={() => setCustomInput(String(v))}
                  >
                    <Text style={s.quickChipTxt}>{v.toLocaleString('tr-TR')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.customBtns}>
                <TouchableOpacity style={s.customCancel} onPress={() => setCustomModal(false)}>
                  <Text style={s.customCancelTxt}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.customConfirm} onPress={confirmCustomStake}>
                  <Text style={s.customConfirmTxt}>Masayı Aç</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  back:   { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title:  { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  rankTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 12 },

  rankCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
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
  tableCard:  { width: '47%', backgroundColor: '#f9fafb', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb', gap: 4 },
  tableStake: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  tableLabel: { fontFamily: 'Nunito-Regular', fontSize: 12 },
  tableSelected:    { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tableSelectedTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: '#fff' },

  // Özel masa
  customCard: { borderStyle: 'dashed' },
  customOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  customSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, gap: 14 },
  customTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#111827', textAlign: 'center' },
  customSub:   { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: -8 },
  customInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, borderWidth: 2, borderColor: '#e5e7eb', paddingHorizontal: 16, gap: 10 },
  customInputIcon: { fontSize: 22 },
  customInput: { flex: 1, fontFamily: 'Nunito-ExtraBold', fontSize: 26, color: '#111827', paddingVertical: 14 },
  quickRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  quickChip: { backgroundColor: '#ede9fe', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#c4b5fd' },
  quickChipTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#7c3aed' },
  customBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  customCancel: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  customCancelTxt: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#6b7280' },
  customConfirm: { flex: 2, backgroundColor: '#8b5cf6', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  customConfirmTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#fff' },

  actionRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  randomBtn: { flex: 1, backgroundColor: PURP, borderRadius: 18, padding: 18, alignItems: 'center', gap: 4,
               shadowColor: PURP2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  friendBtn: { flex: 1, backgroundColor: PURP, borderRadius: 18, padding: 18, alignItems: 'center', gap: 4, shadowColor: PURP2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  randomIcon:  { fontSize: 28 },
  randomTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#fff' },
  randomSub:   { fontFamily: 'Nunito-Regular', fontSize: 11, color: '#e9d5ff' },

  friendRow:         { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  friendRowSelected: { borderColor: PURP2, backgroundColor: '#f5f3ff' },
  friendName:  { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#111827' },
  friendLevel: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af', marginTop: 2 },
  emptyBox: { alignItems: 'center', gap: 10, padding: 32 },
  emptyTxt: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#9ca3af' },
  addBtn:   { backgroundColor: PURP, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  addBtnTxt:{ fontFamily: 'Nunito-Bold', fontSize: 14, color: TEXT },
});
