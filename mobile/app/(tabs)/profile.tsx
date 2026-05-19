import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ScrollView, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { userService } from '../../src/services/user.service';
import { storeService } from '../../src/services/store.service';
import api from '../../src/services/api';

const BG     = '#0d0d1a';
const CARD   = '#13132a';
const BORDER = '#2e2b5a';
const PURP   = '#6c3aed';
const PURP2  = '#8b5cf6';
const TEXT   = '#ffffff';
const MUTED  = '#7c7aaa';
const RED    = '#ef4444';

const AVATARS = ['🐺','🦊','🐯','🦁','🐻','🐼','🦝','🐨','🦄','🐲'];
const PRICES  = [0, 0, 0, 100, 100, 250, 250, 500, 500, 1000];

const LEAGUE_ICONS:  Record<string, string> = { iron: '⚙️', bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '🔷', diamond: '💎', champion: '👑' };
const LEAGUE_NAMES:  Record<string, string> = { iron: 'Demir', bronze: 'Bronz', silver: 'Gümüş', gold: 'Altın', platinum: 'Platin', diamond: 'Elmas', champion: 'Şampiyonlar' };
const LEAGUE_COLORS: Record<string, string> = { iron: '#71717a', bronze: '#cd7f32', silver: '#9ca3af', gold: '#f59e0b', platinum: '#38bdf8', diamond: '#06b6d4', champion: '#a78bfa' };

export default function ProfileScreen() {
  const { user, updateUser, logout } = useUserStore();
  const [avatarModal, setAvatarModal] = useState(false);
  const [editModal,   setEditModal]   = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [processing,  setProcessing]  = useState<number | null>(null);
  const [ligInfo,     setLigInfo]     = useState<any>(null);

  useEffect(() => {
    api.get('/lig/current').then(r => setLigInfo(r.data)).catch(() => {});
  }, []);

  if (!user) return null;

  const xpNeeded = user.level * 500;
  const xpPct    = Math.min(user.xp / xpNeeded, 1);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const handleSaveName = async () => {
    const t = newUsername.trim();
    if (t.length < 3) { Alert.alert('Hata', 'En az 3 karakter olmalı.'); return; }
    try {
      await userService.updateProfile({ username: t });
      updateUser({ username: t });
      setEditModal(false);
    } catch (e: any) { Alert.alert('Hata', e.response?.data?.message ?? 'Güncellenemedi.'); }
  };

  const handleAvatarPick = async (idx: number) => {
    const id    = idx + 1;
    const price = PRICES[idx];
    if (user.unlockedAvatars.includes(id)) {
      try {
        await userService.updateProfile({ avatar_id: id });
        updateUser({ avatarId: id });
        setAvatarModal(false);
      } catch {}
    } else {
      Alert.alert('Avatar Satın Al', `${price} Coin karşılığında bu avatarı almak ister misin?`, [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Satın Al', onPress: async () => {
          setProcessing(id);
          try {
            await storeService.unlockAvatar(id, price);
            updateUser({ avatarId: id, unlockedAvatars: [...user.unlockedAvatars, id], coins: user.coins - price });
          } catch (e: any) { Alert.alert('Hata', e.response?.data?.message ?? 'İşlem başarısız.'); }
          finally { setProcessing(null); }
        }},
      ]);
    }
  };

  const menuItems = [
    { icon: '🏅', label: 'Rozetler',      arrow: true,  onPress: () => router.push('/stats' as any) },
    { icon: '🎮', label: 'Oyun Geçmişi',  arrow: true,  onPress: () => router.push('/stats' as any) },
    { icon: '👥', label: 'Arkadaşlar',    arrow: false, onPress: () => router.push('/(tabs)/friends' as any) },
    { icon: '⚙️', label: 'Ayarlar',       arrow: false, onPress: () => router.push('/settings' as any) },
  ];

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Üst: Avatar + İsim + XP ── */}
        <View style={s.top}>
          {/* Avatar */}
          <TouchableOpacity style={s.avatarWrap} onPress={() => setAvatarModal(true)}>
            <Avatar avatarId={user.avatarId} size={80} />
            <View style={s.editBadge}>
              <Text style={{ fontSize: 10, color: '#fff' }}>✏️</Text>
            </View>
          </TouchableOpacity>

          {/* İsim + Seviye */}
          <TouchableOpacity onPress={() => { setNewUsername(user.username); setEditModal(true); }}>
            <Text style={s.username}>{user.username}</Text>
          </TouchableOpacity>
          <Text style={s.level}>Seviye {user.level}</Text>

          {/* XP Bar */}
          <View style={s.xpWrap}>
            <View style={s.xpBg}>
              <View style={[s.xpFill, { width: `${xpPct * 100}%` }]} />
            </View>
            <Text style={s.xpTxt}>{user.xp} / {xpNeeded} XP</Text>
          </View>

          {/* Email doğrulama uyarısı */}
          {!user.emailVerified && (
            <TouchableOpacity
              style={s.verifyBanner}
              onPress={() => router.push({ pathname: '/(auth)/verify-email', params: { email: user.email } } as any)}
            >
              <Text style={s.verifyTxt}>⚠️ E-postanı doğrulamak için dokun</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── İstatistik Özeti ── */}
        <View style={s.statsRow}>
          <StatBox label="Coin" value={`🪙 ${user.coins.toLocaleString('tr-TR')}`} />
          <View style={s.statDiv} />
          <StatBox label="Seri" value={`🔥 ${user.streakCount}`} />
          <View style={s.statDiv} />
          <StatBox label="Seviye" value={`⭐ ${user.level}`} />
        </View>

        {/* ── Lig Bilgisi ── */}
        <TouchableOpacity style={s.ligCard} onPress={() => router.push('/lig' as any)} activeOpacity={0.85}>
          <View style={s.ligLeft}>
            {(() => {
              const league = user.currentLeague ?? 'bronze';
              const color  = LEAGUE_COLORS[league] ?? '#cd7f32';
              return (
                <>
                  <Text style={{ fontSize: 28 }}>{LEAGUE_ICONS[league] ?? '🥉'}</Text>
                  <View>
                    <Text style={[s.ligName, { color }]}>{LEAGUE_NAMES[league] ?? 'Bronz'} Ligi</Text>
                    <Text style={s.ligSub}>
                      {ligInfo ? `#${ligInfo.userRank}. sıra · ${(ligInfo.userScore ?? 0).toLocaleString('tr-TR')} puan` : 'Lig bilgisi yükleniyor...'}
                    </Text>
                  </View>
                </>
              );
            })()}
          </View>
          <Text style={s.ligArrow}>›</Text>
        </TouchableOpacity>

        {/* ── Menü ── */}
        <View style={s.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[s.menuItem, i < menuItems.length - 1 && s.menuBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={s.menuIcon}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              {item.arrow && <Text style={s.menuArrow}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Çıkış Yap ── */}
        <View style={[s.menu, { marginTop: 12 }]}>
          <TouchableOpacity style={s.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[s.menuIcon, { backgroundColor: RED + '22' }]}>
              <Text style={{ fontSize: 20 }}>↗️</Text>
            </View>
            <Text style={[s.menuLabel, { color: RED }]}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── Avatar Seçim Modalı ── */}
      <Modal visible={avatarModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Avatar Seç</Text>
            <FlatList
              data={AVATARS}
              numColumns={4}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={{ gap: 12 }}
              columnWrapperStyle={{ gap: 12, justifyContent: 'center' }}
              renderItem={({ item, index }) => {
                const id       = index + 1;
                const unlocked = user.unlockedAvatars.includes(id);
                const price    = PRICES[index];
                return (
                  <TouchableOpacity
                    style={[s.avatarOpt, id === user.avatarId && s.avatarOptActive]}
                    onPress={() => handleAvatarPick(index)}
                    disabled={processing !== null}
                  >
                    {processing === id
                      ? <ActivityIndicator color={PURP2} />
                      : <Text style={{ fontSize: 34 }}>{item}</Text>}
                    {!unlocked && (
                      <View style={s.priceTag}>
                        <Text style={s.priceTxt}>🪙{price}</Text>
                      </View>
                    )}
                    {unlocked && id === user.avatarId && (
                      <View style={s.activeDot} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={s.closeBtn} onPress={() => setAvatarModal(false)}>
              <Text style={s.closeTxt}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── İsim Düzenleme Modalı ── */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { paddingVertical: 28 }]}>
            <Text style={s.modalTitle}>Kullanıcı Adını Değiştir</Text>
            <TextInput
              style={s.nameInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Yeni kullanıcı adı"
              placeholderTextColor={MUTED}
              maxLength={20}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[s.closeBtn, { flex: 1 }]} onPress={() => setEditModal(false)}>
                <Text style={s.closeTxt}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, { flex: 1 }]} onPress={handleSaveName}>
                <Text style={s.saveTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT }}>{value}</Text>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 20 },

  // ── Üst ──
  top: { alignItems: 'center', paddingTop: 28, paddingBottom: 20, paddingHorizontal: 24 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: PURP, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: BG,
  },
  username: { fontFamily: 'Nunito-ExtraBold', fontSize: 24, color: TEXT, marginBottom: 4 },
  level:    { fontFamily: 'Nunito-Regular',   fontSize: 14, color: MUTED, marginBottom: 14 },
  xpWrap:   { width: '80%', gap: 4 },
  xpBg:     { height: 6, backgroundColor: '#1e1b3a', borderRadius: 3, overflow: 'hidden' },
  xpFill:   { height: 6, borderRadius: 3, backgroundColor: PURP2 },
  xpTxt:    { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, textAlign: 'right' },
  verifyBanner: {
    marginTop: 12, backgroundColor: '#78350f22',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#f59e0b55',
  },
  verifyTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#f59e0b', textAlign: 'center' },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, marginHorizontal: 20,
    borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: BORDER,
  },
  statDiv: { width: 1, height: 32, backgroundColor: BORDER },

  // ── Lig Kartı ──
  ligCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, marginHorizontal: 20, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  ligLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  ligName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  ligSub:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, marginTop: 2 },
  ligArrow: { fontFamily: 'Nunito-Bold', fontSize: 22, color: MUTED },

  // ── Menü ──
  menu: {
    backgroundColor: CARD,
    marginHorizontal: 20, borderRadius: 18,
    borderWidth: 1, borderColor: BORDER,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16, gap: 14,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#1e1b3a',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: TEXT, flex: 1 },
  menuArrow: { fontFamily: 'Nunito-Bold', fontSize: 22, color: MUTED },

  // ── Modaller ──
  modalOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    backgroundColor: '#1a1a35', borderRadius: 24,
    padding: 24, width: '100%', maxWidth: 360,
  },
  modalTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: TEXT, textAlign: 'center', marginBottom: 20 },
  avatarOpt: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: '#13132a', borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarOptActive: { borderColor: PURP2, backgroundColor: PURP + '22' },
  priceTag: {
    position: 'absolute', bottom: 2,
    backgroundColor: '#000000cc', borderRadius: 6, paddingHorizontal: 4,
  },
  priceTxt: { fontFamily: 'Nunito-Bold', fontSize: 9, color: '#fff' },
  activeDot: {
    position: 'absolute', top: 4, right: 4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: PURP2, borderWidth: 1.5, borderColor: '#fff',
  },
  closeBtn: { backgroundColor: '#2a2a4a', borderRadius: 12, padding: 14, alignItems: 'center' },
  closeTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: MUTED },
  saveBtn:  { backgroundColor: PURP, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveTxt:  { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  nameInput: {
    backgroundColor: '#0d0d1a', borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    color: TEXT, fontFamily: 'Nunito-Regular',
    fontSize: 16, paddingHorizontal: 16, paddingVertical: 14,
    marginTop: 4,
  },
});
