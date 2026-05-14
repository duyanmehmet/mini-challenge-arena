import { useEffect, useRef, useState } from 'react';
r 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import { socketService } from '../src/services/socket.service';
import api from '../src/services/api';

const { width: SW } = Dimensions.get('window');

interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  member_count: number;
  weekly_score: number;
  leader_username: string;
  leader_id: string;
}
interface ClanMember {
  id: string;
  username: string;
  avatar_id: number;
  weekly_score: number;
  level: number;
}
interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

type Tab = 'my' | 'chat' | 'search' | 'leaderboard';

const TABS_WITH_CLAN:  { key: Tab; icon: string; label: string }[] = [
  { key: 'my',          icon: '🏰', label: 'Klan'     },
  { key: 'chat',        icon: '💬', label: 'Sohbet'   },
  { key: 'search',      icon: '🔍', label: 'Ara'      },
  { key: 'leaderboard', icon: '🏆', label: 'Sıralama' },
];
const TABS_NO_CLAN: { key: Tab; icon: string; label: string }[] = [
  { key: 'my',          icon: '🏰', label: 'Klanım'   },
  { key: 'search',      icon: '🔍', label: 'Ara'      },
  { key: 'leaderboard', icon: '🏆', label: 'Sıralama' },
];

export default function ClanScreen() {
  const { theme } = useSettingsStore();
  const { user }  = useUserStore();
  const C = Colors[theme];
  const s = styles(C);

  const [tab, setTab]                     = useState<Tab>('my');
  const [myClan, setMyClan]               = useState<Clan | null>(null);
  const [members, setMembers]             = useState<ClanMember[]>([]);
  const [leaderboard, setLeaderboard]     = useState<Clan[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<Clan[]>([]);
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]         = useState('');
  const [chatLoading, setChatLoading]     = useState(false);
  const [loading, setLoading]             = useState(true);
  const [showCreate, setShowCreate]       = useState(false);
  const [creating, setCreating]           = useState(false);
  const [newName, setNewName]             = useState('');
  const [newTag, setNewTag]               = useState('');
  const [newDesc, setNewDesc]             = useState('');
  const chatRef = useRef<ScrollView>(null);

  useEffect(() => { loadMyClan(); }, []);
  useEffect(() => {
    if (tab === 'leaderboard') loadLeaderboard();
    if (tab === 'chat' && myClan) loadChat();
  }, [tab, myClan]);

  useEffect(() => {
    if (!myClan) return;
    const socket = socketService.getSocket();
    if (!socket) return;
    socket.emit('clan_join_room', { clanId: myClan.id });
    socket.on('clan_new_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 80);
    });
    return () => {
      socket.emit('clan_leave_room', { clanId: myClan.id });
      socket.off('clan_new_message');
    };
  }, [myClan]);

  const loadMyClan = async () => {
    try {
      const res = await api.get('/clan/my');
      setMyClan(res.data.clan);
      setMembers(res.data.members ?? []);
    } catch { setMyClan(null); }
    finally { setLoading(false); }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await api.get('/clan/leaderboard/weekly');
      setLeaderboard(res.data ?? []);
    } catch {}
  };

  const loadChat = async () => {
    if (!myClan) return;
    setChatLoading(true);
    try {
      const res = await api.get(`/clan/chat/${myClan.id}`);
      setMessages(res.data ?? []);
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: false }), 120);
    } catch {}
    finally { setChatLoading(false); }
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || !myClan) return;
    const socket = socketService.getSocket();
    socket?.emit('clan_message', { clanId: myClan.id, message: text });
    setChatInput('');
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    try {
      const res = await api.get(`/clan/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data ?? []);
    } catch {}
  };

  const handleJoin = async (clanId: string) => {
    try {
      await api.post(`/clan/join/${clanId}`);
      Alert.alert('✅ Başarılı', 'Klana katıldın!');
      loadMyClan(); setTab('my');
    } catch (e: any) { Alert.alert('Hata', e.response?.data?.message ?? 'Katılınamadı.'); }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newTag.trim()) {
      return Alert.alert('Eksik Bilgi', 'Klan adı ve etiketi zorunludur.');
    }
    setCreating(true);
    try {
      await api.post('/clan/create', { name: newName.trim(), tag: newTag.trim().toUpperCase(), description: newDesc.trim() });
      setShowCreate(false); setNewName(''); setNewTag(''); setNewDesc('');
      loadMyClan(); setTab('my');
    } catch (e: any) { Alert.alert('Hata', e.response?.data?.message ?? 'Oluşturulamadı.'); }
    finally { setCreating(false); }
  };

  const handleLeave = () => {
    const msg = myClan?.leader_id === user?.id
      ? 'Lider olarak ayrılırsanız liderlik bir sonraki üyeye geçer.'
      : `"${myClan?.name}" klanından ayrılmak istediğine emin misin?`;
    Alert.alert('Klandan Ayrıl', msg, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Ayrıl', style: 'destructive', onPress: async () => {
        try {
          await api.post('/clan/leave');
          setMyClan(null); setMembers([]); setMessages([]); setTab('my');
        } catch (e: any) { Alert.alert('Hata', e.response?.data?.message ?? 'İşlem başarısız.'); }
      }},
    ]);
  };

  const handleKick = (m: ClanMember) => {
    Alert.alert('Üyeyi At', `"${m.username}" adlı üyeyi atmak istediğine emin misin?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'At', style: 'destructive', onPress: async () => {
        try {
          await api.post(`/clan/kick/${m.id}`);
          setMembers((prev) => prev.filter((x) => x.id !== m.id));
        } catch (e: any) { Alert.alert('Hata', e.response?.data?.message ?? 'İşlem başarısız.'); }
      }},
    ]);
  };

  const handleInvite = async () => {
    if (!myClan) return;
    await Share.share({ message: `"${myClan.name}" [${myClan.tag}] klanına katıl! Zeka Meydanı'nda birlikte oynayalım 🏆` }).catch(() => {});
  };

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <ActivityIndicator color={C.accentTeal} style={{ marginTop: 80 }} />
    </SafeAreaView>
  );

  const isLeader = myClan?.leader_id === user?.id;
  const tabs = myClan ? TABS_WITH_CLAN : TABS_NO_CLAN;

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[s.backIcon, { color: C.textSecondary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.pageTitle, { color: C.textPrimary }]}>⚔️ Klanlar</Text>
        {myClan
          ? <TouchableOpacity onPress={handleInvite} style={[s.headerBtn, { borderColor: C.accentTeal }]}>
              <Text style={[s.headerBtnText, { color: C.accentTeal }]}>📤 Davet</Text>
            </TouchableOpacity>
          : <View style={{ width: 60 }} />
        }
      </View>

      {/* ── Tab Bar ── */}
      <View style={[s.tabRow, { backgroundColor: C.bgSecondary, borderBottomColor: C.border }]}>
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity key={t.key} style={s.tabItem} onPress={() => setTab(t.key)}>
              <Text style={[s.tabIcon, active && { opacity: 1 }, !active && { opacity: 0.45 }]}>{t.icon}</Text>
              <Text style={[s.tabLabel, { color: active ? C.accentTeal : C.textSecondary }]}>{t.label}</Text>
              {active && <View style={[s.tabUnderline, { backgroundColor: C.accentTeal }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ══════════════════════════════════════════ */}
      {/*  TAB: KLANIM                               */}
      {/* ══════════════════════════════════════════ */}
      {tab === 'my' && !myClan && !showCreate && (
        <View style={s.emptyPage}>
          <Text style={s.emptyEmoji}>⚔️</Text>
          <Text style={[s.emptyTitle, { color: C.textPrimary }]}>Henüz klanın yok</Text>
          <Text style={[s.emptySub, { color: C.textSecondary }]}>Bir klana katıl ya da kendi klanını kur</Text>
          <TouchableOpacity style={[s.primaryBtn, { backgroundColor: C.accentTeal }]} onPress={() => setShowCreate(true)}>
            <Text style={s.primaryBtnText}>+ Klan Kur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.ghostBtn, { borderColor: C.border }]} onPress={() => setTab('search')}>
            <Text style={[s.ghostBtnText, { color: C.textSecondary }]}>🔍 Klan Ara</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'my' && !myClan && showCreate && (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setShowCreate(false)}>
            <Text style={[s.backLink, { color: C.textSecondary }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Yeni Klan Oluştur</Text>
          <TextInput style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
            placeholder="Klan adı (min 3 karakter)" placeholderTextColor={C.textSecondary}
            value={newName} onChangeText={setNewName} maxLength={30} />
          <TextInput style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
            placeholder="Etiket — 2-5 büyük harf (örn: ACE)" placeholderTextColor={C.textSecondary}
            value={newTag} onChangeText={(t) => setNewTag(t.toUpperCase())} maxLength={5} autoCapitalize="characters" />
          <TextInput style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border, height: 80 }]}
            placeholder="Açıklama (isteğe bağlı)" placeholderTextColor={C.textSecondary}
            value={newDesc} onChangeText={setNewDesc} maxLength={100} multiline />
          <TouchableOpacity style={[s.primaryBtn, { backgroundColor: C.accentTeal }]} onPress={handleCreate} disabled={creating}>
            {creating ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Klan Kur</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}

      {tab === 'my' && myClan && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>

          {/* Klan banner */}
          <View style={[s.banner, { backgroundColor: C.bgSecondary, borderColor: C.accentTeal }]}>
            <View style={[s.bannerTag, { backgroundColor: C.accentTeal }]}>
              <Text style={s.bannerTagText}>[{myClan.tag}]</Text>
            </View>
            <Text style={[s.bannerName, { color: C.textPrimary }]} numberOfLines={1}>{myClan.name}</Text>
            {!!myClan.description && (
              <Text style={[s.bannerDesc, { color: C.textSecondary }]} numberOfLines={2}>{myClan.description}</Text>
            )}
            <View style={[s.bannerStats, { borderTopColor: C.border }]}>
              <BannerStat icon="👥" label="Üye"     value={String(myClan.member_count)}                  color={C.accentTeal}   />
              <View style={[s.statDivider, { backgroundColor: C.border }]} />
              <BannerStat icon="🏅" label="Haftalık" value={myClan.weekly_score.toLocaleString('tr-TR')} color='#f0c040'        />
              <View style={[s.statDivider, { backgroundColor: C.border }]} />
              <BannerStat icon="👑" label="Lider"   value={myClan.leader_username}                       color={C.accentPurple} />
            </View>
          </View>

          {/* Aksiyon */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[s.chipBtn, { backgroundColor: C.accentTeal + '18', borderColor: C.accentTeal, flex: 1 }]} onPress={handleInvite}>
              <Text style={[s.chipBtnText, { color: C.accentTeal }]}>📤 Arkadaş Davet Et</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.chipBtn, { backgroundColor: C.danger + '18', borderColor: C.danger }]} onPress={handleLeave}>
              <Text style={[s.chipBtnText, { color: C.danger }]}>Ayrıl</Text>
            </TouchableOpacity>
          </View>

          {/* Üyeler */}
          <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Üyeler</Text>
          {members.map((m, i) => {
            const rankColor = i === 0 ? '#f0c040' : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : C.textSecondary;
            return (
              <View key={m.id} style={[s.memberRow, { backgroundColor: C.bgSecondary }]}>
                <Text style={[s.memberRankText, { color: rankColor }]}>
                  {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.memberUsername, { color: C.textPrimary }]} numberOfLines={1}>{m.username}</Text>
                  <Text style={[s.memberLevel, { color: C.textSecondary }]}>Seviye {m.level}</Text>
                </View>
                <Text style={[s.memberWeekly, { color: '#f0c040' }]}>{m.weekly_score.toLocaleString('tr-TR')}</Text>
                {isLeader && m.id !== user?.id && (
                  <TouchableOpacity onPress={() => handleKick(m)} style={s.kickBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ fontSize: 12, color: C.danger, fontFamily: 'Nunito-Bold' }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB: SOHBET                               */}
      {/* ══════════════════════════════════════════ */}
      {tab === 'chat' && myClan && (
        <View style={{ flex: 1 }}>
          {chatLoading
            ? <ActivityIndicator color={C.accentTeal} style={{ marginTop: 40 }} />
            : (
              <ScrollView
                ref={chatRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 14, gap: 6 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {messages.length === 0 && (
                  <View style={{ alignItems: 'center', marginTop: 60, gap: 8 }}>
                    <Text style={{ fontSize: 40 }}>💬</Text>
                    <Text style={[s.emptySub, { color: C.textSecondary }]}>Henüz mesaj yok{'\n'}İlk mesajı sen gönder!</Text>
                  </View>
                )}
                {messages.map((msg) => {
                  const isMe = msg.user_id === user?.id;
                  return (
                    <View key={msg.id} style={[s.msgWrap, isMe && { alignItems: 'flex-end' }]}>
                      {!isMe && (
                        <Text style={[s.msgAuthor, { color: C.accentTeal }]}>{msg.username}</Text>
                      )}
                      <View style={[s.bubble, {
                        backgroundColor: isMe ? C.accentPurple : C.bgSecondary,
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                      }]}>
                        <Text style={[s.bubbleText, { color: isMe ? '#fff' : C.textPrimary }]}>{msg.message}</Text>
                      </View>
                      <Text style={[s.msgTime, { color: C.textSecondary }]}>
                        {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  );
                })}
                <View style={{ height: 8 }} />
              </ScrollView>
            )
          }
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={[s.chatBar, { backgroundColor: C.bgSecondary, borderTopColor: C.border }]}>
            <TextInput
              style={[s.chatInput, { backgroundColor: C.bgTertiary, color: C.textPrimary }]}
              placeholder="Mesaj yaz..." placeholderTextColor={C.textSecondary}
              value={chatInput} onChangeText={setChatInput}
              maxLength={300} returnKeyType="send" onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[s.sendBtn, { backgroundColor: chatInput.trim() ? C.accentPurple : C.bgTertiary }]}
              onPress={sendMessage} disabled={!chatInput.trim()}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>➤</Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB: ARA                                  */}
      {/* ══════════════════════════════════════════ */}
      {tab === 'search' && (
        <View style={{ flex: 1, padding: 16 }}>
          <View style={s.searchBar}>
            <TextInput
              style={[s.searchInput, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
              placeholder="Klan adı veya etiketi..." placeholderTextColor={C.textSecondary}
              value={searchQuery} onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch} returnKeyType="search"
            />
            <TouchableOpacity style={[s.searchBtn, { backgroundColor: C.accentTeal }]} onPress={handleSearch}>
              <Text style={{ color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 14 }}>Ara</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={{ gap: 10 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 50, gap: 8 }}>
                <Text style={{ fontSize: 36 }}>🔍</Text>
                <Text style={[s.emptySub, { color: C.textSecondary }]}>
                  {searchQuery ? 'Sonuç bulunamadı' : 'Klan adı veya etiketi yaz'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[s.searchCard, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <View style={[s.tagPill, { backgroundColor: C.accentPurple + '22' }]}>
                    <Text style={[s.tagPillText, { color: C.accentPurple }]}>[{item.tag}]</Text>
                  </View>
                  <Text style={[s.searchCardName, { color: C.textPrimary, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[s.memberCountText, { color: C.textSecondary }]}>👥 {item.member_count}</Text>
                </View>
                {!!item.description && (
                  <Text style={[s.searchCardDesc, { color: C.textSecondary }]} numberOfLines={2}>{item.description}</Text>
                )}
                {!myClan && (
                  <TouchableOpacity style={[s.joinBtn, { backgroundColor: C.accentTeal }]} onPress={() => handleJoin(item.id)}>
                    <Text style={s.joinBtnText}>Katıl</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </View>
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB: SIRALAMA                             */}
      {/* ══════════════════════════════════════════ */}
      {tab === 'leaderboard' && (
        <FlatList
          data={leaderboard}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<ActivityIndicator color={C.accentTeal} style={{ marginTop: 40 }} />}
          renderItem={({ item, index }) => {
            const isMyC = myClan?.id === item.id;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
            return (
              <View style={[s.lbCard, {
                backgroundColor: isMyC ? C.accentTeal + '15' : C.bgSecondary,
                borderColor: isMyC ? C.accentTeal : 'transparent',
                borderWidth: isMyC ? 1.5 : 0,
              }]}>
                <View style={s.lbRankBox}>
                  {medal
                    ? <Text style={{ fontSize: 22 }}>{medal}</Text>
                    : <Text style={[s.lbRankNum, { color: C.textSecondary }]}>#{index + 1}</Text>
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.lbName, { color: C.textPrimary }]} numberOfLines={1}>
                    <Text style={{ color: C.accentPurple }}>[{item.tag}]</Text> {item.name}
                  </Text>
                  <Text style={[s.lbMeta, { color: C.textSecondary }]}>👥 {item.member_count} üye</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.lbScore, { color: '#f0c040' }]}>{item.weekly_score.toLocaleString('tr-TR')}</Text>
                  <Text style={[s.lbScoreLabel, { color: C.textSecondary }]}>puan</Text>
                </View>
              </View>
            );
          }}
        />
      )}

    </SafeAreaView>
  );
}

function BannerStat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1, gap: 2 }}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 13, color }} numberOfLines={1}>{value}</Text>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 10, color: '#888' }}>{label}</Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bgPrimary },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  backIcon:       { fontSize: 22 },
  pageTitle:      { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  headerBtn:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  headerBtnText:  { fontFamily: 'Nunito-Bold', fontSize: 12 },

  // Tab bar
  tabRow:         { flexDirection: 'row', borderBottomWidth: 1 },
  tabItem:        { flex: 1, alignItems: 'center', paddingVertical: 8, position: 'relative' },
  tabIcon:        { fontSize: 16, marginBottom: 2 },
  tabLabel:       { fontFamily: 'Nunito-Bold', fontSize: 10 },
  tabUnderline:   { position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, borderRadius: 2 },

  // Banner (klan kartı)
  banner:         { borderRadius: 18, borderWidth: 1.5, overflow: 'hidden' },
  bannerTag:      { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, margin: 14, marginBottom: 4, borderRadius: 8 },
  bannerTagText:  { color: '#fff', fontFamily: 'Nunito-ExtraBold', fontSize: 12 },
  bannerName:     { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#fff', paddingHorizontal: 14, marginBottom: 4 },
  bannerDesc:     { fontFamily: 'Nunito-Regular', fontSize: 12, paddingHorizontal: 14, marginBottom: 12, lineHeight: 18 },
  bannerStats:    { flexDirection: 'row', borderTopWidth: 1, paddingVertical: 14 },
  statDivider:    { width: 1, marginVertical: 4 },

  // Üyeler
  sectionTitle:   { fontFamily: 'Nunito-ExtraBold', fontSize: 14, letterSpacing: 0.3, marginTop: 4 },
  memberRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  memberRankText: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, width: 30, textAlign: 'center' },
  memberUsername: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  memberLevel:    { fontFamily: 'Nunito-Regular', fontSize: 11, marginTop: 1 },
  memberWeekly:   { fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  kickBtn:        { width: 26, height: 26, borderRadius: 13, backgroundColor: '#e74c3c18', alignItems: 'center', justifyContent: 'center' },

  // Butonlar
  primaryBtn:     { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#fff' },
  ghostBtn:       { borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5 },
  ghostBtnText:   { fontFamily: 'Nunito-Bold', fontSize: 14 },
  chipBtn:        { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', borderWidth: 1.5 },
  chipBtnText:    { fontFamily: 'Nunito-Bold', fontSize: 12 },
  backLink:       { fontFamily: 'Nunito-Regular', fontSize: 14, marginBottom: 4 },

  // Form
  input:          { borderRadius: 12, padding: 13, fontSize: 14, borderWidth: 1.5, fontFamily: 'Nunito-Regular' },

  // Empty states
  emptyPage:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyEmoji:     { fontSize: 56, marginBottom: 4 },
  emptyTitle:     { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  emptySub:       { fontFamily: 'Nunito-Regular', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  // Chat
  chatBar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, paddingBottom: Platform.OS === 'android' ? 14 : 10, gap: 8, borderTopWidth: 1 },
  chatInput:      { flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: 'Nunito-Regular', minHeight: 46, maxHeight: 100 },
  sendBtn:        { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgWrap:        { maxWidth: SW * 0.75, alignSelf: 'flex-start', gap: 2 },
  msgAuthor:      { fontFamily: 'Nunito-Bold', fontSize: 11, marginLeft: 6 },
  bubble:         { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  bubbleText:     { fontFamily: 'Nunito-Regular', fontSize: 14, lineHeight: 20 },
  msgTime:        { fontFamily: 'Nunito-Regular', fontSize: 10, marginLeft: 6 },

  // Search
  searchBar:      { flexDirection: 'row', gap: 8, marginBottom: 12 },
  searchInput:    { flex: 1, borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1.5, fontFamily: 'Nunito-Regular' },
  searchBtn:      { borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  searchCard:     { borderRadius: 14, padding: 14, borderWidth: 1 },
  searchCardName: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  searchCardDesc: { fontFamily: 'Nunito-Regular', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  tagPill:        { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagPillText:    { fontFamily: 'Nunito-ExtraBold', fontSize: 12 },
  memberCountText:{ fontFamily: 'Nunito-Regular', fontSize: 12 },
  joinBtn:        { borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  joinBtnText:    { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#fff' },

  // Leaderboard
  lbCard:         { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, gap: 10 },
  lbRankBox:      { width: 38, alignItems: 'center' },
  lbRankNum:      { fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  lbName:         { fontFamily: 'Nunito-Bold', fontSize: 14 },
  lbMeta:         { fontFamily: 'Nunito-Regular', fontSize: 11, marginTop: 2 },
  lbScore:        { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  lbScoreLabel:   { fontFamily: 'Nunito-Regular', fontSize: 10 },
});
