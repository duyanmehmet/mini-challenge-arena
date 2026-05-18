import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, ActivityIndicator, Platform, StatusBar, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Avatar } from '../../src/components/ui/Avatar';
import api from '../../src/services/api';

const BG    = '#0d0d1a';
const CARD  = '#13132a';
const PURP  = '#6c3aed';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const BORDER= '#2e2b5a';

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
  const [kbHeight,    setKbHeight]    = useState(0);
  const listRef = useRef<FlatList>(null);

  // Klavye yüksekliğini dinle
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      setKbHeight(e.endCoordinates.height);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
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
    <View style={[s.root, { paddingTop: topPad }]}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top:12, bottom:12, left:12, right:12 }}>
          <Text style={s.back}>←</Text>
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
          contentContainerStyle={[s.listPad, { paddingBottom: INPUT_BAR_H + kbHeight + bottomPad + 8 }]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item?.sender_id === myId;
            return (
              <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                <View style={[s.bubble, isMe ? s.bMe : s.bThem]}>
                  <Text style={s.bubbleTxt}>{item?.content}</Text>
                </View>
                <Text style={[s.time, isMe ? { textAlign: 'right' } : {}]}>
                  {item?.created_at ? fmt(item.created_at) : ''}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* ── Input — klavye yüksekliğine göre yukarı kayar ── */}
      <View style={[s.inputBar, { bottom: kbHeight + bottomPad }]}>
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

    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: BG, gap: 10,
  },
  back:      { fontFamily: 'Nunito-ExtraBold', fontSize: 26, color: MUTED },
  headerName:{ fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: TEXT, flex: 1 },
  duelBtn:   { backgroundColor: '#6c3aed22', borderRadius: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#6c3aed55' },

  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  centerlabel:{ fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  emptyTitle:{ fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },
  emptySub:  { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },

  listPad: { paddingHorizontal: 14, paddingTop: 10 },

  bubble:  { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bMe:     { backgroundColor: '#6c3aed', borderBottomRightRadius: 4 },
  bThem:   { backgroundColor: '#13132a', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: BORDER },
  bubbleTxt:{ fontFamily: 'Nunito-Regular', fontSize: 15, color: TEXT, lineHeight: 22 },
  time:    { fontFamily: 'Nunito-Regular', fontSize: 10, color: MUTED, marginTop: 2, paddingHorizontal: 4 },

  // Absolute input — her zaman görünür
  inputBar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: BORDER,
    backgroundColor: BG, gap: 10,
  },
  input: {
    flex: 1, minHeight: 46, maxHeight: 100,
    backgroundColor: '#13132a', borderRadius: 23,
    paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: 'Nunito-Regular', fontSize: 15, color: TEXT,
    borderWidth: 1, borderColor: BORDER,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#6c3aed', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  sendTxt: { fontSize: 18, color: TEXT },
});
