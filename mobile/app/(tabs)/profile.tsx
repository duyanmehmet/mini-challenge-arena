import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList, ActivityIndicator, Alert, TextInput }
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useUserStore } from '../../src/store/userStore';
import { Colors } from '../../src/constants/colors';
import { Avatar } from '../../src/components/ui/Avatar';
import { XPBar } from '../../src/components/ui/XPBar';
import { CoinDisplay } from '../../src/components/ui/CoinDisplay';
import { CATEGORIES as GAME_MODES } from '../../src/constants/categories';
import { LEAGUES } from '../../src/constants/leagues';
import { BADGES } from '../../src/constants/badges';
import { userService } from '../../src/services/user.service';
import { storeService } from '../../src/services/store.service';

const AVATARS = [
  { emoji: '🐺', price: 0 }, { emoji: '🦊', price: 0 }, { emoji: '🐯', price: 0 },
  { emoji: '🦁', price: 100 }, { emoji: '🐻', price: 100 }, { emoji: '🐼', price: 250 },
  { emoji: '🦝', price: 250 }, { emoji: '🐨', price: 500 }, { emoji: '🦄', price: 500 },
  { emoji: '🐲', price: 1000 }
];

const EMOJIS = ['🐺','🦊','🐯','🦁','🐻','🐼','🦝','🐨','🦄','🐲'];

export default function ProfileScreen() {
  const { theme } = useSettingsStore();
  const { user, updateUser, badges, personalBests } = useUserStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const C = Colors[theme];

  const handleUsernameEdit = () => {
    setNewUsername(user?.username ?? '');
    setEditingName(true);
  };

  const handleUsernameSave = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed.length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalı.');
      return;
    }
    try {
      await userService.updateProfile({ username: trimmed });
      updateUser({ username: trimmed });
      setEditingName(false);
      Alert.alert('✅ Güncellendi', 'Kullanıcı adın değiştirildi.');
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'Güncellenemedi.');
    }
  };

  const handleAvatarPress = async (index: number) => {
    if (!user) return;
    const avatarId = index + 1;
    const isUnlocked = user.unlockedAvatars.includes(avatarId);

    if (isUnlocked) {
      try {
        await userService.updateProfile({ avatar_id: avatarId });
        updateUser({ avatarId });
        setModalVisible(false);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Satın alma onayı
      const price = [0, 0, 0, 100, 100, 250, 250, 500, 500, 1000][index];
      Alert.alert(
        'Avatar Satın Al',
        `${price} Coin karşılığında bu avatarın kilidini açmak istiyor musun?`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Satın Al', onPress: () => unlockAvatar(avatarId) }
        ]
      );
    }
  };

  const unlockAvatar = async (avatarId: number) => {
    const price = [0, 0, 0, 100, 100, 250, 250, 500, 500, 1000][avatarId - 1] ?? 0;
    setProcessing(avatarId);
    try {
      await storeService.unlockAvatar(avatarId, price);
      const unlockedAvatars = [...(user?.unlockedAvatars ?? []), avatarId];
      updateUser({ avatarId, unlockedAvatars, coins: (user?.coins ?? 0) - price });
      Alert.alert('Başarılı!', 'Avatar kilidi açıldı.');
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.');
    } finally {
      setProcessing(null);
    }
  };

  if (!user) return null;

  const league = LEAGUES.find((l) => l.id === user.currentLeague);
  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Avatar avatarId={user.avatarId} size={80} />
            <View style={s.editBadge}><Text style={{ fontSize: 10 }}>✏️</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUsernameEdit} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={s.username}>{user.username}</Text>
            <Text style={{ fontSize: 14, opacity: 0.5 }}>✏️</Text>
          </TouchableOpacity>
          <Text style={s.levelBadge}>{league?.icon} {league?.name} • Seviye {user.level}</Text>
          {user.streakCount > 0 && (
            <Text style={[s.streak, { color: C.accentRed }]}>
              🔥 {user.streakCount} günlük seri{user.maxStreak > user.streakCount ? ` (en iyi: ${user.maxStreak})` : ''}
            </Text>
          )}
          <CoinDisplay amount={user.coins} size="lg" />
          {/* Klan bilgisi */}
          {(user as any).clanId && (
            <TouchableOpacity
              style={[s.clanBadge, { backgroundColor: C.accentTeal + '18', borderColor: C.accentTeal }]}
              onPress={() => router.push('/clan' as any)}
            >
              <Text style={[s.clanBadgeText, { color: C.accentTeal }]}>🛡️ Klanım</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar Selection Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: C.bgSecondary }]}>
              <Text style={s.modalTitle}>Avatar Market</Text>
              <FlatList
                data={EMOJIS}
                numColumns={4}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => {
                  const id = index + 1;
                  const unlocked = user.unlockedAvatars.includes(id);
                  const price = [0, 0, 0, 100, 100, 250, 250, 500, 500, 1000][index];
                  
                  return (
                    <TouchableOpacity 
                      style={[s.avatarOption, { opacity: unlocked ? 1 : 0.6 }]} 
                      onPress={() => handleAvatarPress(index)}
                      disabled={processing !== null}
                    >
                      <Text style={{ fontSize: 32 }}>{item}</Text>
                      {!unlocked && (
                        <View style={s.priceTag}>
                          <Text style={s.priceText}>🪙 {price}</Text>
                        </View>
                      )}
                      {unlocked && id === user.avatarId && (
                        <View style={s.selectedDot} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity style={s.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: C.textSecondary, fontFamily: 'Nunito-Bold' }}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Kullanıcı Adı Düzenleme Modalı */}
        <Modal visible={editingName} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: C.bgSecondary }]}>
              <Text style={[s.modalTitle, { color: C.textPrimary }]}>Kullanıcı Adını Değiştir</Text>
              <TextInput
                style={[s.nameInput, { backgroundColor: C.bgTertiary, color: C.textPrimary, borderColor: C.border }]}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Yeni kullanıcı adı"
                placeholderTextColor={C.textSecondary}
                maxLength={20}
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[s.closeBtn, { flex: 1, backgroundColor: C.bgTertiary, borderRadius: 12 }]}
                  onPress={() => setEditingName(false)}
                >
                  <Text style={{ color: C.textSecondary, fontFamily: 'Nunito-Bold', textAlign: 'center' }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.closeBtn, { flex: 1, backgroundColor: C.accentTeal, borderRadius: 12 }]}
                  onPress={handleUsernameSave}
                >
                  <Text style={{ color: '#fff', fontFamily: 'Nunito-Bold', textAlign: 'center' }}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Diğer kısımlar aynı kalır ... */}
        <View style={s.section}>
          <XPBar xp={user.xp} level={user.level} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>📊 Kişisel Rekorlar</Text>
          {GAME_MODES.map((mode) => {
            const pb = personalBests.find((p) => p.mode === mode.id);
            return (
              <View key={mode.id} style={[s.statRow, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
                <Text style={{ fontSize: 22, width: 36 }}>{mode.icon}</Text>
                <Text style={[s.modeName, { color: C.textPrimary }]}>{mode.name}</Text>
                <Text style={[s.statScore, { color: C.accentYellow }]}>
                  {pb ? pb.score.toLocaleString('tr-TR') : '—'}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>🎖 Rozetler ({badges.length}/{BADGES.length})</Text>
          <View style={s.badgeGrid}>
            {BADGES.map((b) => {
              const owned = badges.includes(b.id);
              return (
                <View key={b.id} style={[s.badge, { backgroundColor: owned ? C.bgTertiary : C.bgSecondary, opacity: owned ? 1 : 0.3 }]}>
                  <Text style={{ fontSize: 28 }}>{b.icon}</Text>
                  <Text style={[s.badgeName, { color: C.textSecondary }]} numberOfLines={1}>{b.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={[s.settingsBtn, { backgroundColor: C.bgSecondary, borderColor: C.border }]} onPress={() => router.push('/settings')}>
          <Text style={[s.settingsBtnText, { color: C.textPrimary }]}>⚙️ Ayarlar</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  header: { alignItems: 'center', padding: 24, gap: 8 },
  editBadge: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#fff', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  username: { color: C.textPrimary, fontSize: 22, fontFamily: 'Nunito-ExtraBold' },
  levelBadge: { color: C.textSecondary, fontFamily: 'Nunito-Regular', fontSize: 14 },
  streak: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: C.textPrimary, fontFamily: 'Nunito-Bold', fontSize: 16, marginBottom: 10 },
  statRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, gap: 10 },
  modeName: { flex: 1, fontFamily: 'Nunito-Regular', fontSize: 14 },
  statScore: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { width: '31%', borderRadius: 12, padding: 10, alignItems: 'center', gap: 4 },
  badgeName: { fontSize: 10, fontFamily: 'Nunito-Regular', textAlign: 'center' },
  settingsBtn: { marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 1, alignItems: 'center' },
  settingsBtnText: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', borderRadius: 24, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontFamily: 'Nunito-ExtraBold', color: C.textPrimary, textAlign: 'center', marginBottom: 20 },
  avatarOption: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', margin: 4, borderRadius: 16, backgroundColor: '#00000011' },
  priceTag: { position: 'absolute', bottom: 4, backgroundColor: '#000000aa', paddingHorizontal: 4, borderRadius: 4 },
  priceText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito-Bold' },
  selectedDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },
  closeBtn: { marginTop: 0, padding: 12, alignItems: 'center' },
  clanBadge: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1.5 },
  clanBadgeText: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  nameInput: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1.5, fontFamily: 'Nunito-Regular', marginTop: 8 },
});
