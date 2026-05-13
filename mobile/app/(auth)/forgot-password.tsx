import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import api from '../../src/services/api';

export default function ForgotPasswordScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: trimmed });
      setSent(true);
    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.userMessage ?? 'E-posta gönderilemedi.';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(C);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>

        <Text style={[s.title, { color: C.textPrimary }]}>🔑 Şifremi Unuttum</Text>

        {sent ? (
          <View style={[s.successBox, { backgroundColor: C.success + '18', borderColor: C.success }]}>
            <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>✉️</Text>
            <Text style={[s.successText, { color: C.success }]}>
              E-posta gönderildi!
            </Text>
            <Text style={[s.successSub, { color: C.textSecondary }]}>
              {email} adresine şifre sıfırlama bağlantısı gönderdik. Spam klasörünü de kontrol et.
            </Text>
            <TouchableOpacity style={[s.button, { backgroundColor: C.bgSecondary, marginTop: 16 }]} onPress={() => router.back()}>
              <Text style={[s.buttonText, { color: C.textPrimary }]}>← Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[s.desc, { color: C.textSecondary }]}>
              Kayıtlı e-posta adresini gir, şifre sıfırlama bağlantısı gönderelim.
            </Text>
            <TextInput
              style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
              placeholder="E-posta adresi"
              placeholderTextColor={C.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[s.button, { backgroundColor: C.accentRed, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.buttonText}>📨 Bağlantı Gönder</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary },
  inner: { flex: 1, padding: 24, paddingTop: 60 },
  back: { marginBottom: 32 },
  backText: { fontSize: 16, fontFamily: 'Nunito-Regular' },
  title: { fontSize: 26, fontFamily: 'Nunito-ExtraBold', marginBottom: 12 },
  desc: { fontSize: 15, marginBottom: 24, fontFamily: 'Nunito-Regular', lineHeight: 22 },
  input: {
    borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16,
    borderWidth: 1.5, fontFamily: 'Nunito-Regular',
  },
  button: { borderRadius: 14, padding: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'Nunito-Bold' },
  successBox: { borderRadius: 18, padding: 24, borderWidth: 1.5, alignItems: 'center' },
  successText: { fontSize: 20, fontFamily: 'Nunito-ExtraBold', textAlign: 'center', marginBottom: 8 },
  successSub: { fontSize: 14, fontFamily: 'Nunito-Regular', textAlign: 'center', lineHeight: 22 },
});
