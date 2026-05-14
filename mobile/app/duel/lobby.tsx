import { useEffect, useState } from 'react';
r 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import { socketService } from '../../src/services/socket.service';
import api from '../../src/services/api';
import { Avatar } from '../../src/components/ui/Avatar';

interface Friend {
  id: string;
  username: string;
  avatarId: number;
  level: number;
}

const DUEL_CATEGORIES = [
  { id: 'general',   label: 'Genel',   icon: '💡' },
  { id: 'history',   label: 'Tarih',   icon: '🏺' },
  { id: 'science',   label: 'Bilim',   icon: '🔬' },
  { id: 'sports',    label: 'Spor',    icon: '⚽' },
  { id: 'cinema',    label: 'Sinema',  icon: '🎬' },
  { id: 'geography', label: 'Coğrafya',icon: '🌍' },
];

export default function DuelLobbyScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const s = styles(C);

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
      // API userId döndürüyor, id'ye normalize ediyoruz
      const normalized: Friend[] = (res.data ?? []).map((f: any) => ({
        id: f.userId ?? f.id,
        username: f.username,
        avatarId: f.avatarId ?? f.avatar_id ?? 0,
        level: f.level ?? 1,
      }));
      setFriends(normalized);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const sendChallenge = () => {
    if (!selectedFriend) {
      Alert.alert('Arkadaş Seç', 'Listeden bir arkadaş seç!');
      return;
    }
    const socket = socketService.getSocket();
    if (!socket) { Alert.alert('Bağlantı yok', 'Sunucuya bağlanılamadı.'); return; }
    socket.emit('duel_invite', { targetId: selectedFriend.id, mode: selectedCat });
    setWaiting(true);
  };

  const selectedCatObj = DUEL_CATEGORIES.find((c) => c.id === selectedCat)!;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={[s.backText, { color: C.textSecondary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>⚔️ Düello</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Kategori seçimi */}
        <Text style={[s.label, { color: C.textSecondary }]}>KATEGORİ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
          {DUEL_CATEGORIES.map((cat) => {
            const active = cat.id === selectedCat;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[s.catChip, { backgroundColor: active ? C.accentPurple : C.bgSecondary, borderColor: active ? C.accentPurple : C.border }]}
                onPress={() => setSelectedCat(cat.id)}
              >
                <Text style={s.catIcon}>{cat.icon}</Text>
                <Text style={[s.catLabel, { color: active ? '#fff' : C.textSecondary }]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Seçili özet */}
        <View style={[s.summaryBox, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
          <View style={s.summaryItem}>
            <Text style={[s.summaryKey, { color: C.textSecondary }]}>Kategori</Text>
            <Text style={[s.summaryVal, { color: C.textPrimary }]}>{selectedCatObj.icon} {selectedCatObj.label}</Text>
          </View>
          <View style={[s.divider, { backgroundColor: C.border }]} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryKey, { color: C.textSecondary }]}>Rakip</Text>
            <Text style={[s.summaryVal, { color: selectedFriend ? C.accentPurple : C.textSecondary }]}>
              {selectedFriend ? selectedFriend.username : 'Seçilmedi'}
            </Text>
          </View>
        </View>

        {/* Arkadaş listesi */}
        <Text style={[s.label, { color: C.textSecondary }]}>ARKADAŞLAR</Text>
        {loading ? (
          <ActivityIndicator color={C.accentPurple} style={{ marginTop: 24 }} />
        ) : friends.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={{ fontSize: 36 }}>👥</Text>
            <Text style={[s.emptyText, { color: C.textSecondary }]}>Henüz arkadaşın yok</Text>
            <TouchableOpacity
              style={[s.emptyBtn, { backgroundColor: C.accentPurple }]}
              onPress={() => router.push('/(tabs)/friends' as any)}
            >
              <Text style={s.emptyBtnText}>Arkadaş Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.friendList}>
            {friends.map((item) => {
              const isSelected = selectedFriend?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.friendRow, {
                    backgroundColor: isSelected ? C.accentPurple + '22' : C.bgSecondary,
                    borderColor: isSelected ? C.accentPurple : C.border,
                  }]}
                  onPress={() => setSelectedFriend(isSelected ? null : item)}
                >
                  <Avatar avatarId={item.avatarId} size={38} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[s.friendName, { color: C.textPrimary }]}>{item.username}</Text>
                    <Text style={[s.friendLevel, { color: C.textSecondary }]}>Seviye {item.level}</Text>
                  </View>
                  <View style={[s.radioOuter, { borderColor: isSelected ? C.accentPurple : C.border }]}>
                    {isSelected && <View style={[s.radioInner, { backgroundColor: C.accentPurple }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer — Düello butonu */}
      <View style={[s.footer, { borderTopColor: C.border }]}>
        <TouchableOpacity
          style={[s.challengeBtn, { backgroundColor: waiting || !selectedFriend ? C.bgTertiary : C.accentPurple }]}
          onPress={sendChallenge}
          disabled={waiting || !selectedFriend}
          activeOpacity={0.8}
        >
          {waiting ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color="#fff" />
              <Text style={s.challengeText}>Cevap bekleniyor...</Text>
            </View>
          ) : (
            <Text style={[s.challengeText, { color: selectedFriend ? '#fff' : C.textSecondary }]}>
              {selectedFriend ? `⚔️ ${selectedFriend.username}'ı Düelloya Davet Et` : 'Önce Arkadaş Seç'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bgPrimary },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:      { width: 36, height: 36, justifyContent: 'center' },
  backText:     { fontSize: 22 },
  title:        { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  label:        { fontFamily: 'Nunito-Bold', fontSize: 11, letterSpacing: 1, paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  catRow:       { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  catChip:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5 },
  catIcon:      { fontSize: 14 },
  catLabel:     { fontFamily: 'Nunito-Bold', fontSize: 12 },
  summaryBox:   { marginHorizontal: 16, marginTop: 16, borderRadius: 14, borderWidth: 1, flexDirection: 'row', overflow: 'hidden' },
  summaryItem:  { flex: 1, padding: 14, alignItems: 'center' },
  summaryKey:   { fontFamily: 'Nunito-Regular', fontSize: 11, marginBottom: 4 },
  summaryVal:   { fontFamily: 'Nunito-Bold', fontSize: 14 },
  divider:      { width: 1 },
  friendList:   { paddingHorizontal: 16, gap: 8 },
  friendRow:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 10, borderWidth: 1.5 },
  friendName:   { fontFamily: 'Nunito-Bold', fontSize: 14 },
  friendLevel:  { fontFamily: 'Nunito-Regular', fontSize: 11, marginTop: 1 },
  radioOuter:   { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner:   { width: 10, height: 10, borderRadius: 5 },
  emptyBox:     { alignItems: 'center', gap: 12, paddingVertical: 40 },
  emptyText:    { fontFamily: 'Nunito-Regular', fontSize: 14 },
  emptyBtn:     { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  footer:       { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12, borderTopWidth: 1 },
  challengeBtn: { borderRadius: 14, padding: 15, alignItems: 'center' },
  challengeText:{ fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
});
