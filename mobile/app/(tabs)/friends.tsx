import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import { Avatar } from '../../src/components/ui/Avatar';
import { LEAGUES } from '../../src/constants/leagues';
import { socketService } from '../../src/services/socket.service';
import { socialService } from '../../src/services/social.service';

export default function FriendsScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [f, p] = await Promise.all([
        socialService.getFriends(),
        socialService.getPendingRequests()
      ]);
      setFriends(f);
      setPendingRequests(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchText.length < 3) return;
    setSearching(true);
    try {
      const data = await socialService.searchUsers(searchText);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (userId: string) => {
    try {
      await socialService.sendFriendRequest(userId);
      Alert.alert('Başarılı', 'İstek gönderildi.');
      setSearchResults([]);
      setSearchText('');
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.');
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await socialService.acceptFriendRequest(requestId);
      refreshData();
    } catch (err) {
      Alert.alert('Hata', 'İstek kabul edilemedi.');
    }
  };

  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.title}>👥 Arkadaşlar</Text>

      {/* Arama Barı */}
      <View style={s.searchSection}>
        <TextInput
          style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
          placeholder="Arkadaş ara (min. 3 harf)..."
          placeholderTextColor={C.textSecondary}
          value={searchText}
          onChangeText={(t) => {
            setSearchText(t);
            if (t.length >= 3) handleSearch();
            else setSearchResults([]);
          }}
          autoCapitalize="none"
        />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Arama Sonuçları */}
        {searchResults.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Arama Sonuçları</Text>
            {searchResults.map((item) => (
              <View key={item.id} style={[s.row, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
                <Avatar avatarId={item.avatar_id} size={36} />
                <Text style={[s.username, { color: C.textPrimary }]}>{item.username}</Text>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.accentTeal }]} onPress={() => sendRequest(item.id)}>
                  <Text style={s.actionBtnText}>Ekle</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Bekleyen İstekler */}
        {pendingRequests.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: C.accentYellow }]}>Bekleyen İstekler</Text>
            {pendingRequests.map((item) => (
              <View key={item.friendship_id} style={[s.row, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
                <Avatar avatarId={item.avatar_id} size={36} />
                <Text style={[s.username, { color: C.textPrimary }]}>{item.username}</Text>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.success }]} onPress={() => acceptRequest(item.friendship_id)}>
                  <Text style={s.actionBtnText}>Kabul Et</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Arkadaş Listesi */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Arkadaşlarım ({friends.length})</Text>
          {friends.length === 0 && !loading && (
            <Text style={{ color: C.textSecondary, textAlign: 'center', marginTop: 20 }}>Henüz arkadaşın yok.</Text>
          )}
          {friends.map((item, index) => {
            const league = LEAGUES.find((l) => l.id === item.league);
            return (
              <View key={item.userId} style={[s.row, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
                <Text style={[s.rank, { color: C.textSecondary }]}>#{index + 1}</Text>
                <Avatar avatarId={item.avatarId} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.username, { color: C.textPrimary }]}>{item.username}</Text>
                  <Text style={[s.leagueText, { color: C.textSecondary }]}>{league?.icon} {league?.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.score, { color: C.accentYellow }]}>{item.weeklyScore.toLocaleString('tr-TR')}</Text>
                  <TouchableOpacity
                    style={[s.duelBtn, { backgroundColor: C.accentRed + '22', borderColor: C.accentRed }]}
                    onPress={() => {
                      const socket = socketService.getSocket();
                      if (socket) {
                        socket.emit('duel_invite', { opponentId: item.userId, mode: 'reflex' });
                        Alert.alert('Davet Gönderildi', `${item.username} oyuncusuna düello daveti gönderildi.`);
                      }
                    }}
                  >
                    <Text style={[s.duelText, { color: C.accentRed }]}>⚔ Düello</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// styles update
import { ScrollView } from 'react-native-gesture-handler';

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  title: { color: C.textPrimary, fontSize: 22, fontFamily: 'Nunito-ExtraBold', padding: 16, paddingBottom: 8 },
  searchSection: { paddingHorizontal: 16, marginBottom: 16 },
  input: { borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { color: C.textPrimary, fontFamily: 'Nunito-Bold', fontSize: 15, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, gap: 12 },
  username: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14 },
  actionBtn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  actionBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito-Bold' },
  rank: { width: 28, fontFamily: 'Nunito-Bold', fontSize: 13 },
  leagueText: { fontFamily: 'Nunito-Regular', fontSize: 12 },
  score: { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
  duelBtn: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, marginTop: 4 },
  duelText: { fontFamily: 'Nunito-Bold', fontSize: 11 },
});
