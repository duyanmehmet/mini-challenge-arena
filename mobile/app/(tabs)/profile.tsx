import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ScrollView, FlatList, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { userService } from '../../src/services/user.service';
import { storeService } from '../../src/services/store.service';
import api from '../../src/services/api';

const BG     = '#ffffff';
const CARD   = '#ffffff';
const BORDER = '#f3f4f6';
const PURP   = '#6c3aed';
const PURP2  = '#8b5cf6';
const TEXT   = '#111827';
const MUTED  = '#9ca3af';
const RED    = '#ef4444';

const AVATARS = ['🐺','🦊','🐯','🦁','🐻','🐼','🦝','🐨','🦄','🐲'];
const PRICES  = [0, 0, 0, 100, 100, 250, 250, 500, 500, 1000]; // Mağaza ile senkronize

const LEAGUE_ICONS: Record<string, string> = {
  filiz:'🌱',kaya:'🪨',demir:'🔩',celik:'⚔️',bronz:'🥉',
  gumus:'🥈',altin:'🥇',safir:'🔵',zumrut:'💚',elmas:'💎',
  platin:'🔷',kristal:'🌟',mistik:'🔮',ay:'🌙',gunes:'☀️',
  simsek:'⚡',alev:'🔥',okyanus:'🌊',zirve:'🏔️',kartal:'🦅',
  ejderha:'🐉',galaksi:'🌌',nova:'💫',efsane:'🦄',kral:'👑',
  yildiz:'⭐',meteor:'🌠',zafer:'🏆',elit:'🎯',sampiyon:'🏅',
};
const LEAGUE_NAMES: Record<string, string> = {
  filiz:'Filiz',kaya:'Kaya',demir:'Demir',celik:'Çelik',bronz:'Bronz',
  gumus:'Gümüş',altin:'Altın',safir:'Safir',zumrut:'Zümrüt',elmas:'Elmas',
  platin:'Platin',kristal:'Kristal',mistik:'Mistik',ay:'Ay',gunes:'Güneş',
  simsek:'Şimşek',alev:'Alev',okyanus:'Okyanus',zirve:'Zirve',kartal:'Kartal',
  ejderha:'Ejderha',galaksi:'Galaksi',nova:'Nova',efsane:'Efsane',kral:'Kral',
  yildiz:'Yıldız',meteor:'Meteor',zafer:'Zafer',elit:'Elit',sampiyon:'Şampiyon',
};
const LEAGUE_COLORS: Record<string, string> = {
  filiz:'#86efac',kaya:'#a8a29e',demir:'#94a3b8',celik:'#64748b',bronz:'#cd7f32',
  gumus:'#9ca3af',altin:'#f59e0b',safir:'#3b82f6',zumrut:'#22c55e',elmas:'#06b6d4',
  platin:'#38bdf8',kristal:'#e2e8f0',mistik:'#a855f7',ay:'#c4b5fd',gunes:'#fbbf24',
  simsek:'#facc15',alev:'#f97316',okyanus:'#0ea5e9',zirve:'#e2e8f0',kartal:'#854d0e',
  ejderha:'#dc2626',galaksi:'#6366f1',nova:'#f0abfc',efsane:'#e879f9',kral:'#fde047',
  yildiz:'#fef08a',meteor:'#fb923c',zafer:'#f59e0b',elit:'#f43f5e',sampiyon:'#a78bfa',
};

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

  const XP_THRESHOLDS = [0,100,250,500,1000,1500,2500,4000,6000,10000,15000,25000,40000,60000,80000,100000];
  const levelIdx  = Math.min(user.level - 1, XP_THRESHOLDS.length - 1);
  const curThresh = XP_THRESHOLDS[levelIdx] ?? 0;
  const nextThresh= XP_THRESHOLDS[levelIdx + 1];
  const xpPct     = nextThresh ? Math.min((user.xp - curThresh) / (nextThresh - curThresh), 1) : 1;
  const xpToNext  = nextThresh ? nextThresh - user.xp : 0;

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

  const menuItems: { ionicon: string; color: string; bg: string; label: string; arrow: boolean; onPress: () => void }[] = [
    { ionicon: 'trophy-outline',         color: '#f59e0b', bg: '#fef9c3', label: 'Sıralamalar',   arrow: true,  onPress: () => router.push('/(tabs)/leaderboard' as any) },
    { ionicon: 'ribbon-outline',         color: '#8b5cf6', bg: '#ede9fe', label: 'Rozetler',      arrow: true,  onPress: () => router.push('/badges' as any) },
    { ionicon: 'game-controller-outline',color: '#06b6d4', bg: '#e0f2fe', label: 'Oyun Geçmişi',  arrow: true,  onPress: () => router.push('/stats' as any) },
    { ionicon: 'people-outline',         color: '#10b981', bg: '#d1fae5', label: 'Arkadaşlar',    arrow: false, onPress: () => router.push('/(tabs)/friends' as any) },
    { ionicon: 'settings-outline',       color: '#6b7280', bg: '#f3f4f6', label: 'Ayarlar',       arrow: false, onPress: () => router.push('/settings' as any) },
  ];

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Geri butonu ── */}
        <View style={s.backRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backBtn}>← Geri</Text>
          </TouchableOpacity>
        </View>

        {/* ── Üst: Avatar + İsim + XP ── */}
        <View style={s.top}>
          {/* Avatar */}
          <TouchableOpacity style={s.avatarWrap} onPress={() => setAvatarModal(true)}>
            <Avatar avatarId={user.avatarId} size={80} />
            <View style={s.editBadge}>
              <Ionicons name="pencil" size={11} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* İsim + Seviye */}
          <TouchableOpacity onPress={() => { setNewUsername(user.username); setEditModal(true); }}>
            <Text style={s.username}>{user.username}</Text>
          </TouchableOpacity>
          <Text style={s.level}>Seviye {user.level}</Text>

          {/* XP Bar */}
          <View style={s.xpWrap}>
            <View style={s.xpRow}>
              <Text style={s.xpLvlTxt}>Seviye {user.level}</Text>
              <Text style={s.xpLvlTxt}>{nextThresh ? `Seviye ${user.level + 1}` : '🏆 Maks'}</Text>
            </View>
            <View style={s.xpBg}>
              <View style={[s.xpFill, { width: `${xpPct * 100}%` }]} />
            </View>
            <Text style={s.xpTxt}>
              {nextThresh
                ? `${user.xp.toLocaleString('tr-TR')} / ${nextThresh.toLocaleString('tr-TR')} XP — ${xpToNext.toLocaleString('tr-TR')} XP daha`
                : 'Maksimum Seviyeye Ulaştın!'}
            </Text>
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
              <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.ionicon as any} size={20} color={item.color} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              {item.arrow && <Ionicons name="chevron-forward" size={18} color="#d1d5db" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Çıkış Yap ── */}
        <View style={[s.menu, { marginTop: 12 }]}>
          <TouchableOpacity style={s.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[s.menuIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
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
      <Text style={{ fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#111827' }}>{value}</Text>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 20 },
  backRow:{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  backBtn:{ fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden', alignSelf: 'flex-start' },

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
  xpRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  xpLvlTxt: { fontFamily: 'Nunito-Bold', fontSize: 11, color: PURP2 },
  xpBg:     { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  xpFill:   { height: 8, borderRadius: 4, backgroundColor: PURP2 },
  xpTxt:    { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, textAlign: 'center' },
  verifyBanner: {
    marginTop: 12, backgroundColor: '#78350f22',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#f59e0b55',
  },
  verifyTxt: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#f59e0b', textAlign: 'center' },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 20,
    borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statDiv: { width: 1, height: 32, backgroundColor: '#f3f4f6' },

  // ── Lig Kartı ──
  ligCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  ligLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  ligName:  { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  ligSub:   { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af', marginTop: 2 },
  ligArrow: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#d1d5db' },

  // ── Menü ──
  menu: {
    backgroundColor: '#fff',
    marginHorizontal: 20, borderRadius: 18,
    borderWidth: 1, borderColor: '#f3f4f6',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16, gap: 14,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#111827', flex: 1 },
  menuArrow: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#d1d5db' },

  // ── Modaller ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 24, width: '100%', maxWidth: 360,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#111827', textAlign: 'center', marginBottom: 20 },
  avatarOpt: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarOptActive: { borderColor: PURP2, backgroundColor: '#ede9fe' },
  priceTag: {
    position: 'absolute', bottom: 2,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 4,
  },
  priceTxt: { fontFamily: 'Nunito-Bold', fontSize: 9, color: '#fff' },
  activeDot: {
    position: 'absolute', top: 4, right: 4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: PURP2, borderWidth: 1.5, borderColor: '#fff',
  },
  closeBtn: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 14, alignItems: 'center' },
  closeTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#6b7280' },
  saveBtn:  { backgroundColor: PURP, borderRadius: 12, padding: 14, alignItems: 'center' },
  saveTxt:  { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  nameInput: {
    backgroundColor: '#f9fafb', borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
    color: '#111827', fontFamily: 'Nunito-Regular',
    fontSize: 16, paddingHorizontal: 16, paddingVertical: 14,
    marginTop: 4,
  },
});
