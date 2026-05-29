import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Avatar } from '../src/components/ui/Avatar';
import api from '../src/services/api';

const BG    = '#ffffff';
const CARD  = '#f9fafb';
const PURP  = '#8b5cf6';
const PURP2 = '#7c3aed';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const BORDER= '#f3f4f6';
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

  const deleteConvo = (friendId: string, friendName: string) => {
    Alert.alert(
      'Sohbeti Sil',
      `${friendName} ile tüm mesajlar silinsin mi?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/messages/conversation/${friendId}`);
              setConvos(p => p.filter((c: any) => c.friend_id !== friendId));
            } catch {
              Alert.alert('Hata', 'Sohbet silinemedi.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>Sohbet</Text>
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
              onLongPress={() => deleteConvo(item.friend_id, item.friend_username)}
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
  root:  { flex: 1, backgroundColor: '#ffffff' },
  header:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fff' },
  backBtn: { },
  backTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title:   { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#111827' },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyIcon:  { fontSize: 56 },
  emptyTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827' },
  emptySub:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#9ca3af' },
  goFriends:  { backgroundColor: '#8b5cf6', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  goFriendsTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },

  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9fafb', gap: 14, backgroundColor: '#fff' },
  rowUnread:{ backgroundColor: '#faf5ff' },
  avatarWrap: { position: 'relative' },
  badge:    { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: '#fff' },
  badgeTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 10, color: '#fff' },
  rowContent: { flex: 1 },
  rowTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  friendName:{ fontFamily: 'Nunito-Bold', fontSize: 15, color: '#111827' },
  time:     { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af' },
  lastMsg:  { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#9ca3af' },
});
