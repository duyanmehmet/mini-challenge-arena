import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { Colors } from '../src/constants/colors';
import api from '../src/services/api';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    if (!token) {
      Alert.alert('Hata', 'Geçersiz bağlantı. Lütfen e-postadaki linke tekrar tıklayın.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setDone(true);
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'İşlem başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(C);

  if (done) {
    return (
      <View style={[s.root, { backgroundColor: C.bgPrimary }]}>
        <View style={s.inner}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
          <Text style={[s.title, { color: C.textPrimary }]}>Şifre Güncellendi!</Text>
          <Text style={[s.sub, { color: C.textSecondary }]}>
            Yeni şifrenizle giriş yapabilirsiniz.
          </Text>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: C.accentRed ?? '#e94560' }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={s.btnText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.inner}>
        <Text style={{ fontSize: 56, marginBottom: 12 }}>🔑</Text>
        <Text style={[s.title, { color: C.textPrimary }]}>Yeni Şifre</Text>
        <Text style={[s.sub, { color: C.textSecondary }]}>
          Hesabınız için güçlü bir şifre belirleyin.
        </Text>

        <View style={[s.inputRow, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
          <TextInput
            style={[s.input, { color: C.textPrimary }]}
            placeholder="Yeni şifre (en az 6 karakter)"
            placeholderTextColor={C.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={s.eye}>
            <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[s.inputRow, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
          <TextInput
            style={[s.input, { color: C.textPrimary }]}
            placeholder="Şifreyi tekrar girin"
            placeholderTextColor={C.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: C.accentRed ?? '#e94560', opacity: loading ? 0.7 : 1 }]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Şifremi Güncelle</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={s.cancel}>
          <Text style={[s.cancelText, { color: C.textSecondary }]}>← Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (C: ReturnType<typeof Colors[keyof typeof Colors]>) => StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 26, fontFamily: 'Nunito-ExtraBold', marginBottom: 8 },
  sub: { fontSize: 15, fontFamily: 'Nunito-Regular', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    marginBottom: 14, width: '100%', paddingRight: 12,
  },
  input: { flex: 1, padding: 16, fontSize: 16, fontFamily: 'Nunito-Regular' },
  eye: { padding: 4 },
  btn: {
    width: '100%', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 8, marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 17, fontFamily: 'Nunito-Bold' },
  cancel: { marginTop: 4 },
  cancelText: { fontSize: 14, fontFamily: 'Nunito-Regular' },
});
