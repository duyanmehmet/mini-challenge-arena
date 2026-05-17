import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Avatar } from '../../src/components/ui/Avatar';
import { socketService } from '../../src/services/socket.service';
import api from '../../src/services/api';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const BORDER= '#2e2b5a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const RED   = '#ef4444';

interface FriendProfile {
  id: string;
  username: string;
  avatarId: number;
  level: number;
  xp: number;
  weeklyScore: number;
  totalGames?: number;
  winRate?: number;
  totalScore?: number;
}

export default function FriendProfileScreen() {
  const { userId, username, avatarId, level, weeklyScore } = useLocalSearchParams<{
    userId: string;
    username: string;
    avatarId: string;
    level: string;
    weeklyScore: string;
  }>();

  const [profile, setProfile] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    // Temel bilgileri hemen göster, detayları API'den çek
    setProfile({
      id: userId,
      username: username ?? '',
      avatarId: parseInt(avatarId ?? '1'),
      level: parseInt(level ?? '1'),
      xp: 0,
      weeklyScore: parseInt(weeklyScore ?? '0'),
      totalGames: undefined,
      winRate: undefined,
      totalScore: undefined,
    });

    api.get(`/user/friend-stats/${userId}`)
      .then(res => {
        setProfile(prev => prev ? { ...prev, ...res.data } : prev);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDuel = () => {
    const socket = socketService.getSocket();
    if (!socket) { Alert.alert('Bağlantı yok', 'Socket bağlantısı kurulamadı.'); return; }
    const duelId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    socket.emit('duel_invite', { friendId: userId, mode: 'general', duelId });
    Alert.alert('Düello Daveti Gönderildi', `${username} adlı arkadaşına davet gönderildi!`);
  };

  const handleRemove = () => {
    Alert.alert(
      'Arkadaşı Sil',
      `${username} adlı kişiyi arkadaş listenizden çıkarmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await api.delete(`/social/friend/${userId}`);
              router.back();
            } catch {
              Alert.alert('Hata', 'İşlem başarısız.');
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  if (!profile) return (
    <SafeAreaView style={s.root}>
      <ActivityIndicator color={PURP2} style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  const xpNeeded = profile.level * 500;
  const xpPct    = Math.min((profile.xp || 0) / xpNeeded, 1);

  return (
    <SafeAreaView style={s.root}>
      {/* Geri */}
      <TouchableOpacity onPress={() => router.back()} style={s.back}>
        <Text style={s.backTxt}>← Geri</Text>
      </TouchableOpacity>

      <View style={s.inner}>
        {/* ── Profil Kartı ── */}
        <View style={s.card}>
          {/* Avatar + İsim + Seviye */}
          <View style={s.topRow}>
            <Avatar avatarId={profile.avatarId} size={72} />
            <View style={s.nameCol}>
              <Text style={s.username}>{profile.username}</Text>
              <Text style={s.levelTxt}>Seviye {profile.level}</Text>
              {/* XP bar */}
              <View style={s.xpWrap}>
                <View style={s.xpBg}>
                  <View style={[s.xpFill, { width: `${xpPct * 100}%` }]} />
                </View>
                <Text style={s.xpTxt}>
                  {profile.xp || 0} / {xpNeeded} XP
                </Text>
              </View>
            </View>
          </View>

          {/* ── İstatistikler ── */}
          <View style={s.statsRow}>
            <StatCol label="Toplam Oyun" value={String(profile.totalGames ?? profile.weeklyScore ?? '—')} />
            <View style={s.statDiv} />
            <StatCol label="Kazanma Oranı" value={profile.winRate !== undefined ? `%${profile.winRate}` : '—'} />
            <View style={s.statDiv} />
            <StatCol label="Toplam Puan" value={profile.totalScore?.toLocaleString('tr-TR') ?? profile.weeklyScore.toLocaleString('tr-TR')} />
          </View>
        </View>

        {/* ── Butonlar ── */}
        <TouchableOpacity style={s.duelBtn} onPress={handleDuel} activeOpacity={0.85}>
          <Text style={s.duelTxt}>⚔️ Düello Davet Et</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.removeBtn} onPress={handleRemove} disabled={removing} activeOpacity={0.7}>
          {removing
            ? <ActivityIndicator color={RED} size="small" />
            : <Text style={s.removeTxt}>Arkadaşı Sil</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatCol({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginBottom: 6 }}>{label}</Text>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG },
  back:  { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backTxt: { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },

  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 14 },

  // Kart
  card: {
    backgroundColor: CARD,
    borderRadius: 24, borderWidth: 1, borderColor: BORDER,
    padding: 20, gap: 20,
  },

  // Üst satır
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nameCol: { flex: 1, gap: 4 },
  username: { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT },
  levelTxt: { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  xpWrap:   { marginTop: 6, gap: 4 },
  xpBg:     { height: 5, backgroundColor: '#1e1b3a', borderRadius: 3, overflow: 'hidden' },
  xpFill:   { height: 5, borderRadius: 3, backgroundColor: PURP2 },
  xpTxt:    { fontFamily: 'Nunito-Regular', fontSize: 10, color: MUTED, textAlign: 'right' },

  // İstatistikler
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  statDiv:  { width: 1, height: 36, backgroundColor: BORDER },

  // Butonlar
  duelBtn: {
    backgroundColor: PURP, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: PURP2, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  duelTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT },
  removeBtn: { alignItems: 'center', paddingVertical: 12 },
  removeTxt: { fontFamily: 'Nunito-Bold', fontSize: 15, color: RED },
});
