import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { socketService } from '../../src/services/socket.service';
import api from '../../src/services/api';
import { Avatar } from '../../src/components/ui/Avatar';

interface Friend {
  id: string;
  username: string;
  avatarId: number;
  level: number;
  isOnline?: boolean;
}

const DUEL_CATEGORIES = [
  { id: 'general',  label: 'Genel Kültür', icon: '💡' },
  { id: 'history',  label: 'Tarih',        icon: '🏺' },
  { id: 'science',  label: 'Bilim',        icon: '🔬' },
  { id: 'sports',   label: 'Spor',         icon: '⚽' },
  { id: 'cinema',   label: 'Sinema',       icon: '🎬' },
  { id: 'geography',label: 'Coğrafya',     icon: '🌍' },
];

export default function DuelLobbyScreen() {
  const { theme } = useSettingsStore();
  const { user } = useUserStore();
  const C = Colors[theme];

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedCat, setSelectedCat] = useState(DUEL_CATEGORIES[0].id);
  const [loading, setLoading] = useState(true);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    loadFriends();
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('duel_accepted', (data: { duelId: string; category?: string }) => {
        setWaiting(false);
        router.replace(`/duel/${data.duelId}?cat=${data.category ?? selectedCat}` as any);
      });
      socket.on('duel_rejected', () => {
        setWaiting(false);
        Alert.alert('Reddedildi', 'Arkadaşın düello davetini reddetti.');
      });
    }
    return () => {
      socket?.off('duel_accepted');
      socket?.off('duel_rejected');
    };
  }, [selectedCat]);

  const loadFriends = async () => {
    try {
      const res = await api.get('/social/friends');
      setFriends(res.data ?? []);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const sendChallenge = () => {
    if (!user?.emailVerified) {
      Alert.alert('E-posta Doğrulanmamış', 'Düello için e-postanı doğrulaman gerekiyor.', [
        { text: 'Kapat', style: 'cancel' },
        { text: 'Doğrula', onPress: () => router.push({ pathname: '/(auth)/verify-email', params: { email: user?.email } } as any) },
      ]);
      return;
    }
    if (!selectedFriend) {
      Alert.alert('Arkadaş Seç', 'Düello için bir arkadaş seç!');
      return;
    }
    const socket = socketService.getSocket();
    if (!socket) { Alert.alert('Bağlantı yok'); return; }
    const duelId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    socket.emit('duel_invite', { friendId: selectedFriend.id, mode: selectedCat, duelId });
    setWaiting(true);
  };

  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>⚔️ Düello</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Kategori seçimi */}
      <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Kategori Seç</Text>
      <FlatList
        data={DUEL_CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        renderItem={({ item }) => {
          const active = item.id === selectedCat;
          return (
            <TouchableOpacity
              style={[
                s.catChip,
                {
                  backgroundColor: active ? C.accentPurple : C.bgSecondary,
                  borderColor: active ? C.accentPurple : C.border,
                },
              ]}
              onPress={() => setSelectedCat(item.id)}
            >
              <Text style={s.catChipIcon}>{item.icon}</Text>
              <Text style={[s.catChipLabel, { color: active ? '#fff' : C.textPrimary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        style={{ marginBottom: 16 }}
      />

      {/* Seçili arkadaş */}
      {selectedFriend && (
        <View style={[s.selectedCard, { backgroundColor: C.bgSecondary, borderColor: C.accentPurple }]}>
          <Avatar avatarId={selectedFriend.avatarId} size={44} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.friendName, { color: C.textPrimary }]}>{selectedFriend.username}</Text>
            <Text style={[s.friendLevel, { color: C.textSecondary }]}>Seviye {selectedFriend.level}</Text>
          </View>
          <Text style={{ fontSize: 22 }}>🎯</Text>
        </View>
      )}

      {/* Arkadaş listesi */}
      <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Arkadaşlar</Text>
      {loading ? (
        <ActivityIndicator color={C.accentPurple} style={{ marginTop: 20 }} />
      ) : friends.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={{ fontSize: 40 }}>👥</Text>
          <Text style={[s.emptyText, { color: C.textSecondary }]}>
            Henüz arkadaşın yok.{'\n'}Arkadaş ekleyip düello yap!
          </Text>
          <TouchableOpacity
            style={[s.addFriendBtn, { backgroundColor: C.accentPurple }]}
            onPress={() => router.push('/(tabs)/friends' as any)}
          >
            <Text style={s.addFriendText}>Arkadaş Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedFriend?.id === item.id;
            return (
              <TouchableOpacity
                style={[
                  s.friendRow,
                  {
                    backgroundColor: isSelected ? C.accentPurple + '22' : C.bgSecondary,
                    borderColor: isSelected ? C.accentPurple : C.border,
                  },
                ]}
                onPress={() => setSelectedFriend(isSelected ? null : item)}
              >
                <Avatar avatarId={item.avatarId} size={40} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.friendName, { color: C.textPrimary }]}>{item.username}</Text>
                  <Text style={[s.friendLevel, { color: C.textSecondary }]}>Seviye {item.level}</Text>
                </View>
                {isSelected && <Text style={{ fontSize: 20 }}>✅</Text>}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Düello başlat */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.challengeBtn, { backgroundColor: waiting ? C.bgTertiary : C.accentPurple }]}
          onPress={sendChallenge}
          disabled={waiting}
        >
          {waiting ? (
            <>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.challengeText}>Cevap bekleniyor...</Text>
            </>
          ) : (
            <Text style={s.challengeText}>⚔️ Düelloya Davet Et</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  sectionLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  catChipIcon: { fontSize: 16 },
  catChipLabel: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  selectedCard: { marginHorizontal: 16, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 2, marginBottom: 16 },
  friendRow: { borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5 },
  friendName: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  friendLevel: { fontFamily: 'Nunito-Regular', fontSize: 12, marginTop: 2 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyText: { fontFamily: 'Nunito-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  addFriendBtn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  addFriendText: { fontFamily: 'Nunito-Bold', fontSize: 15, color: '#fff' },
  footer: { padding: 16, paddingBottom: 28 },
  challengeBtn: { borderRadius: 16, padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  challengeText: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' },
});
