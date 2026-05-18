import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Avatar } from '../src/components/ui/Avatar';
import api from '../src/services/api';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const BORDER= '#2e2b5a';
const GREEN = '#22c55e';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Şimdi';
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  return `${Math.floor(h / 24)}g`;
}

export default function MessagesScreen() {
  const { user } = useUserStore();
  const [convos,  setConvos]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    loadConvos();
  }, []));

  const loadConvos = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConvos(Array.isArray(res.data) ? res.data : []);
    } catch { setConvos([]); }
    finally  { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>💬 Mesajlar</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={PURP2} style={{ marginTop: 40 }} size="large" />
      ) : convos.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>💬</Text>
          <Text style={s.emptyTxt}>Henüz mesaj yok</Text>
          <Text style={s.emptySub}>Arkadaşlarına ilk mesajı gönder!</Text>
          <TouchableOpacity style={s.goFriends} onPress={() => router.push('/(tabs)/friends' as any)}>
            <Text style={s.goFriendsTxt}>Arkadaşlara Git</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={convos}
          keyExtractor={(item) => item.friend_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.row, item.unread > 0 && s.rowUnread]}
              onPress={() => router.push(`/chat/${item.friend_id}?name=${item.friend_username}&avatar=${item.friend_avatar}` as any)}
              activeOpacity={0.8}
            >
              <View style={s.avatarWrap}>
                <Avatar avatarId={item.friend_avatar ?? 1} size={48} />
                {item.unread > 0 && (
                  <View style={s.badge}><Text style={s.badgeTxt}>{item.unread > 9 ? '9+' : item.unread}</Text></View>
                )}
              </View>
              <View style={s.rowContent}>
                <View style={s.rowTop}>
                  <Text style={[s.friendName, item.unread > 0 && { color: PURP2 }]}>{item.friend_username}</Text>
                  {item.last_at && <Text style={s.time}>{timeAgo(item.last_at)}</Text>}
                </View>
                <Text style={[s.lastMsg, item.unread > 0 && { color: TEXT }]} numberOfLines={1}>
                  {item.last_message
                    ? (item.sender_id === user?.id ? `Sen: ${item.last_message}` : item.last_message)
                    : 'Mesaj yok'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG },
  header:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 60 },
  backTxt: { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },
  title:   { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyIcon:  { fontSize: 56 },
  emptyTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },
  emptySub:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  goFriends:  { backgroundColor: PURP, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  goFriendsTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: TEXT },

  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER, gap: 14 },
  rowUnread:{ backgroundColor: PURP + '0d' },
  avatarWrap: { position: 'relative' },
  badge:    { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: BG },
  badgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 10, color: TEXT },
  rowContent: { flex: 1 },
  rowTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  friendName:{ fontFamily: 'Nunito-Bold', fontSize: 15, color: TEXT },
  time:     { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  lastMsg:  { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED },
});
