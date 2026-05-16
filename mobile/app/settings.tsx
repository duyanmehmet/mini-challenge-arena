import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet, Alert, TextInput, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import { userService } from '../src/services/user.service';

export default function SettingsScreen() {
  const { theme, setTheme, soundEnabled, toggleSound, vibrationEnabled, toggleVibration } = useSettingsStore();
  const { user, logout } = useUserStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const C = Colors[theme];

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap', style: 'destructive',
        onPress: () => { logout(); router.replace('/(auth)/login'); },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return;
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    try {
      // Backend change password endpoint needed
      await userService.changePassword(oldPassword, newPassword);
      Alert.alert('Başarılı', 'Şifreniz değiştirildi.');
      setModalVisible(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={s.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={s.title}>⚙️ Ayarlar</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Görünüm</Text>
          <View style={s.row}>
            <Text style={s.label}>Tema</Text>
            <View style={s.themeToggle}>
              <TouchableOpacity
                style={[s.themeBtn, theme === 'dark' && { backgroundColor: C.accentRed }]}
                onPress={() => setTheme('dark')}
              >
                <Text style={{ color: theme === 'dark' ? '#fff' : C.textSecondary, fontSize: 13 }}>🌙 Koyu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.themeBtn, theme === 'light' && { backgroundColor: C.accentRed }]}
                onPress={() => setTheme('light')}
              >
                <Text style={{ color: theme === 'light' ? '#fff' : C.textSecondary, fontSize: 13 }}>☀️ Açık</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Oyun</Text>
          <View style={s.row}>
            <Text style={s.label}>🔊 Ses efektleri</Text>
            <Switch value={soundEnabled} onValueChange={toggleSound} trackColor={{ true: C.accentTeal }} thumbColor="#fff" />
          </View>
          <View style={s.row}>
            <Text style={s.label}>📳 Titreşim</Text>
            <Switch value={vibrationEnabled} onValueChange={toggleVibration} trackColor={{ true: C.accentTeal }} thumbColor="#fff" />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Hesap</Text>
          {user && (
            <View style={[s.infoRow, { backgroundColor: C.bgSecondary }]}>
              <Text style={[s.label, { color: C.textSecondary }]}>Kullanıcı adı</Text>
              <Text style={[s.value, { color: C.textPrimary }]}>{user.username}</Text>
            </View>
          )}
          <TouchableOpacity style={[s.infoRow, { backgroundColor: C.bgSecondary }]} onPress={() => setModalVisible(true)}>
            <Text style={[s.label, { color: C.textPrimary }]}>🔑 Şifreyi Değiştir</Text>
            <Text style={{ color: C.textSecondary }}>›</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: C.bgSecondary }]}>
              <Text style={s.modalTitle}>Şifreyi Güncelle</Text>
              <TextInput
                style={[s.input, { borderColor: C.border }]}
                placeholder="Eski Şifre"
                placeholderTextColor={C.textSecondary}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TextInput
                style={[s.input, { borderColor: C.border }]}
                placeholder="Yeni Şifre"
                placeholderTextColor={C.textSecondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <View style={s.modalButtons}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: C.textSecondary }}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.confirmBtn, { backgroundColor: C.accentRed }]} onPress={handleChangePassword}>
                  <Text style={{ color: '#fff', fontFamily: 'Nunito-Bold' }}>Güncelle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Hakkında</Text>
          <Text style={[s.meta, { color: C.textSecondary }]}>Zeka Meydanı v1.0.0</Text>
          <TouchableOpacity onPress={() => router.push('/privacy-policy' as any)}>
            <Text style={[s.link, { color: C.accentTeal }]}>Gizlilik Politikası</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/terms-of-service' as any)}>
            <Text style={[s.link, { color: C.accentTeal }]}>Kullanım Koşulları</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.logoutBtn, { borderColor: C.danger }]} onPress={handleLogout}>
          <Text style={[s.logoutText, { color: C.danger }]}>🚪 Çıkış Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.logoutBtn, { borderColor: C.textSecondary, marginTop: 8 }]}
          onPress={() => Alert.alert(
            'Hesabı Sil',
            'Hesabın ve tüm verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz.',
            [
              { text: 'İptal', style: 'cancel' },
              { text: 'Sil', style: 'destructive', onPress: async () => {
                try {
                  await userService.deleteAccount();
                  logout();
                  router.replace('/(auth)/login');
                } catch {
                  Alert.alert('Hata', 'Hesap silinemedi. Tekrar deneyin.');
                }
              }},
            ]
          )}
        >
          <Text style={[s.logoutText, { color: C.textSecondary }]}>🗑 Hesabı Sil (KVKK)</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  header: { padding: 16, paddingTop: 8 },
  back: { marginBottom: 4 },
  backText: { color: C.textSecondary, fontFamily: 'Nunito-Regular', fontSize: 15 },
  title: { color: C.textPrimary, fontSize: 22, fontFamily: 'Nunito-ExtraBold' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: C.textSecondary, fontFamily: 'Nunito-SemiBold', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  label: { color: C.textPrimary, fontFamily: 'Nunito-Regular', fontSize: 15 },
  themeToggle: { flexDirection: 'row', backgroundColor: C.bgSecondary, borderRadius: 20, overflow: 'hidden' },
  themeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 12, marginBottom: 8, alignItems: 'center' },
  value: { fontFamily: 'Nunito-Regular', fontSize: 14 },
  meta: { fontFamily: 'Nunito-Regular', fontSize: 14, marginBottom: 8 },
  link: { fontFamily: 'Nunito-Regular', fontSize: 14, marginBottom: 6 },
  logoutBtn: { marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 1.5, alignItems: 'center' },
  logoutText: { fontFamily: 'Nunito-Bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: 24 },
  modalContent: { borderRadius: 20, padding: 20 },
  modalTitle: { color: C.textPrimary, fontSize: 18, fontFamily: 'Nunito-ExtraBold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: C.bgPrimary, color: C.textPrimary, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelBtn: { padding: 12 },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
});
