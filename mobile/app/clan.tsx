import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput, ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import api from '../src/services/api';

interface Clan {
  id: number;
  name: string;
  tag: string;
  description: string;
  member_count: number;
  weekly_score: number;
  leader_username: string;
}

interface ClanMember {
  username: string;
  avatar_id: number;
  weekly_score: number;
}

type Tab = 'my' | 'search' | 'leaderboard';

export default function ClanScreen() {
  const { theme } = useSettingsStore();
  const { user } = useUserStore();
  const C = Colors[theme];

  const [tab, setTab]               = useState<Tab>('my');
  const [myClan, setMyClan]         = useState<Clan | null>(null);
  const [members, setMembers]       = useState<ClanMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Clan[]>([]);
  const [leaderboard, setLeaderboard] = useState<Clan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [newName, setNewName]       = useState('');
  const [newTag, setNewTag]         = useState('');
  const [newDesc, setNewDesc]       = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadMyClan(); }, []);
  useEffect(() => { if (tab === 'leaderboard') loadLeaderboard(); }, [tab]);

  const loadMyClan = async () => {
    try {
      const res = await api.get('/clan/my');
      setMyClan(res.data.clan);
      setMembers(res.data.members ?? []);
    } catch {
      setMyClan(null);
    } finally { setLoading(false); }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await api.get('/clan/leaderboard/weekly');
      setLeaderboard(res.data ?? []);
    } catch {}
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    try {
      const res = await api.get(`/clan/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data ?? []);
    } catch {}
  };

  const handleJoin = async (clanId: number) => {
    try {
      await api.post(`/clan/join/${clanId}`);
      Alert.alert('✅ Başarılı', 'Klana katıldın!');
      loadMyClan();
      setTab('my');
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'Katılınamadı.');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newTag.trim()) {
      Alert.alert('Eksik Bilgi', 'Klan adı ve etiketi zorunludur.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/clan/create', { name: newName.trim(), tag: newTag.trim().toUpperCase(), description: newDesc.trim() });
      Alert.alert('🎉 Klan Oluşturuldu!', `"${newName}" klana hoş geldin!`);
      setShowCreate(false);
      loadMyClan();
      setTab('my');
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'Oluşturulamadı.');
    } finally { setCreating(false); }
  };

  const s = styles(C);

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <ActivityIndicator color={C.accentTeal} style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>⚔️ Klanlar</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Bar */}
      <View style={[s.tabBar, { backgroundColor: C.bgSecondary }]}>
        {(['my', 'search', 'leaderboard'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && { borderBottomColor: C.accentTeal, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, { color: tab === t ? C.accentTeal : C.textSecondary }]}>
              {t === 'my' ? 'Klanım' : t === 'search' ? 'Ara' : 'Sıralama'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MY CLAN */}
      {tab === 'my' && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {myClan ? (
            <>
              <View style={[s.clanCard, { backgroundColor: C.bgSecondary, borderColor: C.accentTeal }]}>
                <Text style={[s.clanTag, { backgroundColor: C.accentTeal + '22', color: C.accentTeal }]}>
                  [{myClan.tag}]
                </Text>
                <Text style={[s.clanName, { color: C.textPrimary }]}>{myClan.name}</Text>
                <Text style={[s.clanDesc, { color: C.textSecondary }]}>{myClan.description}</Text>
                <View style={s.clanStats}>
                  <StatPill label="Üye" value={String(myClan.member_count)} color={C.accentTeal} />
                  <StatPill label="Haftalık" value={myClan.weekly_score.toLocaleString('tr-TR')} color='#f0c040' />
                  <StatPill label="Lider" value={myClan.leader_username} color={C.accentPurple} />
                </View>
              </View>

              <Text style={[s.sectionTitle, { color: C.textPrimary }]}>👥 Üyeler</Text>
              {members.map((m, i) => (
                <View key={i} style={[s.memberRow, { backgroundColor: C.bgSecondary }]}>
                  <Text style={[s.memberRank, { color: i < 3 ? '#f0c040' : C.textSecondary }]}>
                    {i === 0 ? '👑' : `#${i + 1}`}
                  </Text>
                  <Text style={[s.memberName, { color: C.textPrimary }]}>{m.username}</Text>
                  <Text style={[s.memberScore, { color: C.accentYellow }]}>
                    {m.weekly_score.toLocaleString('tr-TR')}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <View style={s.emptyBox}>
              <Text style={{ fontSize: 60 }}>⚔️</Text>
              <Text style={[s.emptyTitle, { color: C.textPrimary }]}>Klanın Yok</Text>
              <Text style={[s.emptySub, { color: C.textSecondary }]}>
                Bir klana katıl veya kendi klanını kur!
              </Text>
              <TouchableOpacity
                style={[s.createBtn, { backgroundColor: C.accentTeal }]}
                onPress={() => setShowCreate(true)}
              >
                <Text style={s.createBtnText}>+ Klan Kur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.createBtn, { backgroundColor: C.bgSecondary, marginTop: 10 }]}
                onPress={() => setTab('search')}
              >
                <Text style={[s.createBtnText, { color: C.textPrimary }]}>🔍 Klan Ara</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Klan kurma formu */}
          {showCreate && (
            <View style={[s.createForm, { backgroundColor: C.bgSecondary }]}>
              <Text style={[s.formTitle, { color: C.textPrimary }]}>Yeni Klan</Text>
              <TextInput
                style={[s.input, { backgroundColor: C.bgTertiary, color: C.textPrimary, borderColor: C.border }]}
                placeholder="Klan adı"
                placeholderTextColor={C.textSecondary}
                value={newName}
                onChangeText={setNewName}
                maxLength={30}
              />
              <TextInput
                style={[s.input, { backgroundColor: C.bgTertiary, color: C.textPrimary, borderColor: C.border }]}
                placeholder="Etiket (3-5 harf, örn: ABC)"
                placeholderTextColor={C.textSecondary}
                value={newTag}
                onChangeText={(t) => setNewTag(t.toUpperCase())}
                maxLength={5}
                autoCapitalize="characters"
              />
              <TextInput
                style={[s.input, { backgroundColor: C.bgTertiary, color: C.textPrimary, borderColor: C.border }]}
                placeholder="Açıklama (isteğe bağlı)"
                placeholderTextColor={C.textSecondary}
                value={newDesc}
                onChangeText={setNewDesc}
                maxLength={100}
              />
              <TouchableOpacity
                style={[s.createBtn, { backgroundColor: C.accentTeal }]}
                onPress={handleCreate}
                disabled={creating}
              >
                {creating
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.createBtnText}>Klan Kur</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowCreate(false)} style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: C.textSecondary, fontFamily: 'Nunito-Regular' }}>Vazgeç</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* SEARCH */}
      {tab === 'search' && (
        <View style={{ flex: 1, padding: 16 }}>
          <View style={s.searchRow}>
            <TextInput
              style={[s.searchInput, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
              placeholder="Klan adı veya etiketi..."
              placeholderTextColor={C.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={[s.searchBtn, { backgroundColor: C.accentTeal }]} onPress={handleSearch}>
              <Text style={{ color: '#fff', fontFamily: 'Nunito-Bold' }}>Ara</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchResults}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={{ gap: 10 }}
            ListEmptyComponent={
              <Text style={[s.emptySub, { color: C.textSecondary, textAlign: 'center', marginTop: 40 }]}>
                {searchQuery ? 'Sonuç bulunamadı.' : 'Aramak için klan adı yaz.'}
              </Text>
            }
            renderItem={({ item }) => (
              <View style={[s.clanCard, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={[s.clanTag, { backgroundColor: C.accentPurple + '22', color: C.accentPurple }]}>
                    [{item.tag}]
                  </Text>
                  <Text style={[s.clanName, { color: C.textPrimary, flex: 1 }]}>{item.name}</Text>
                  <Text style={[s.memberCount, { color: C.textSecondary }]}>👥 {item.member_count}</Text>
                </View>
                {item.description ? (
                  <Text style={[s.clanDesc, { color: C.textSecondary }]} numberOfLines={2}>{item.description}</Text>
                ) : null}
                <TouchableOpacity
                  style={[s.joinBtn, { backgroundColor: C.accentTeal }]}
                  onPress={() => handleJoin(item.id)}
                >
                  <Text style={s.joinBtnText}>Katıl</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {/* LEADERBOARD */}
      {tab === 'leaderboard' && (
        <FlatList
          data={leaderboard}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListEmptyComponent={
            <ActivityIndicator color={C.accentTeal} style={{ marginTop: 40 }} />
          }
          renderItem={({ item, index }) => (
            <View style={[s.lbRow, { backgroundColor: C.bgSecondary }]}>
              <Text style={[s.lbRank, { color: index < 3 ? '#f0c040' : C.textSecondary }]}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.lbName, { color: C.textPrimary }]}>
                  [{item.tag}] {item.name}
                </Text>
                <Text style={[s.lbSub, { color: C.textSecondary }]}>👥 {item.member_count} üye</Text>
              </View>
              <Text style={[s.lbScore, { color: '#f0c040' }]}>
                {item.weekly_score.toLocaleString('tr-TR')}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 14, color }}>{value}</Text>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 11, color: '#888' }}>{label}</Text>
    </View>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 20 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontFamily: 'Nunito-Bold', fontSize: 14 },
  clanCard: { borderRadius: 16, padding: 16, gap: 8, borderWidth: 1.5 },
  clanTag: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontFamily: 'Nunito-ExtraBold', fontSize: 12 },
  clanName: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  clanDesc: { fontFamily: 'Nunito-Regular', fontSize: 13, lineHeight: 20 },
  clanStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, gap: 10 },
  memberRank: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, width: 32, textAlign: 'center' },
  memberName: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14 },
  memberScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, marginTop: 4 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 22 },
  emptySub: { fontFamily: 'Nunito-Regular', fontSize: 14, textAlign: 'center' },
  createBtn: { borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, alignItems: 'center', width: '100%' },
  createBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#fff' },
  createForm: { borderRadius: 18, padding: 20, gap: 10 },
  formTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, marginBottom: 4 },
  input: { borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1.5, fontFamily: 'Nunito-Regular' },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  searchInput: { flex: 1, borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1.5, fontFamily: 'Nunito-Regular' },
  searchBtn: { borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  joinBtn: { borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 4 },
  joinBtnText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  memberCount: { fontFamily: 'Nunito-Regular', fontSize: 13 },
  lbRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, gap: 12 },
  lbRank: { fontSize: 22, width: 36, textAlign: 'center' },
  lbName: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  lbSub: { fontFamily: 'Nunito-Regular', fontSize: 12 },
  lbScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
});
