import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, ActivityIndicator, Platform, StatusBar, Keyboard, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Avatar } from '../../src/components/ui/Avatar';
import api from '../../src/services/api';

const BG    = '#ffffff';
const CARD  = '#f3f4f6';
const PURP  = '#8b5cf6';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const BORDER= '#f3f4f6';

const INPUT_BAR_H = 68;

function fmt(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return ''; }
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { userId: friendId, name, avatar } = useLocalSearchParams<{
    userId: string; name?: string; avatar?: string;
  }>();
  const { user } = useUserStore();

  const [messages,    setMessages]    = useState<any[]>([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const listRef = useRef<FlatList>(null);

  // Klavye açıldığında listeyi en alta kaydır
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => show.remove();
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [friendId]));

  const load = async () => {
    if (!friendId) { setLoading(false); return; }
    try {
      const res  = await api.get(`/messages/${friendId}`);
      const raw  = res.data;
      const msgs = Array.isArray(raw) ? raw : (raw?.messages ?? []);
      setMessages(msgs);
    } catch { setMessages([]); }
    finally  { setLoading(false); }
  };

  const send = async () => {
    const txt = input.trim();
    if (!txt || sending) return;
    setSending(true);
    setInput('');
    try {
      const res = await api.post(`/messages/${friendId}`, { content: txt });
      setMessages(p => [...p, res.data]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch { setInput(txt); }
    finally  { setSending(false); }
  };

  const topPad    = insets.top + (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);
  const bottomPad = Math.max(insets.bottom, 8);
  const myId      = user?.id;

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: topPad }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Avatar avatarId={parseInt(avatar ?? '1')} size={38} />
        <Text style={s.headerName} numberOfLines={1}>{name ?? '...'}</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={s.duelBtn} onPress={() => router.push('/duel/lobby' as any)}>
          <Text style={{ fontSize: 18 }}>⚔️</Text>
        </TouchableOpacity>
      </View>

      {/* ── Mesaj listesi — altta input alanı için padding ── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#8b5cf6" size="large" />
          <Text style={s.centerlabel}>Yükleniyor...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 52 }}>💬</Text>
          <Text style={s.emptyTitle}>Henüz mesaj yok</Text>
          <Text style={s.emptySub}>İlk mesajı gönder 👋</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item, i) => item?.id ?? String(i)}
          style={{ flex: 1 }}
          contentContainerStyle={[s.listPad, { paddingBottom: 8 }]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item?.sender_id === myId;
            return (
              <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                <View style={[s.bubble, isMe ? s.bMe : s.bThem]}>
                  <Text style={[s.bubbleTxt, { color: isMe ? '#ffffff' : '#111827' }]}>{item?.content}</Text>
                </View>
                <Text style={[s.time, isMe ? { textAlign: 'right' } : {}]}>
                  {item?.created_at ? fmt(item.created_at) : ''}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* ── Input bar — her zaman ekranın altında, klavye üstünde ── */}
      <View style={[s.inputBar, { paddingBottom: bottomPad }]}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Mesaj yaz..."
          placeholderTextColor={MUTED}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || sending) && { opacity: 0.35 }]}
          onPress={send}
          disabled={!input.trim() || sending}
          activeOpacity={0.8}
        >
          {sending
            ? <ActivityIndicator color={TEXT} size="small" />
            : <Text style={s.sendTxt}>➤</Text>}
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff', flexDirection: 'column' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff', gap: 10,
  },
  back:      { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  headerName:{ fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#111827', flex: 1 },
  duelBtn:   { backgroundColor: '#ede9fe', borderRadius: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#c4b5fd' },

  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  centerlabel:{ fontFamily: 'Nunito-Regular', fontSize: 14, color: '#9ca3af' },
  emptyTitle:{ fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: '#111827' },
  emptySub:  { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#9ca3af' },

  listPad: { paddingHorizontal: 14, paddingTop: 14, gap: 2 },

  bubble:  { maxWidth: '78%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11 },
  bMe:     { backgroundColor: '#8b5cf6', borderBottomRightRadius: 5 },
  bThem:   { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 5 },
  bubbleTxt:{ fontFamily: 'Nunito-Regular', fontSize: 15, lineHeight: 22 },
  time:    { fontFamily: 'Nunito-Regular', fontSize: 10, color: '#9ca3af', marginTop: 3, paddingHorizontal: 4 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff', gap: 10,
  },
  input: {
    flex: 1, minHeight: 46, maxHeight: 100,
    backgroundColor: '#f9fafb', borderRadius: 24,
    paddingHorizontal: 18, paddingVertical: 12,
    fontFamily: 'Nunito-Regular', fontSize: 15, color: '#111827',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  sendTxt: { fontSize: 18, color: '#ffffff' },
});
