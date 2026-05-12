import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';

export default function ForgotPasswordScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Hata', 'E-posta adresi gerekli.');
      return;
    }
    setLoading(true);
    try {
      // TODO: gerçek API çağrısı
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(C);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={s.backText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={s.title}>Şifremi Unuttum</Text>

        {sent ? (
          <Text style={s.successText}>
            ✅ E-posta gönderildi! Gelen kutunuzu kontrol edin.
          </Text>
        ) : (
          <>
            <Text style={s.desc}>E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.</Text>
            <TextInput
              style={s.input}
              placeholder="E-posta"
              placeholderTextColor={C.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.button} onPress={handleSend} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Gönder</Text>}
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
  backText: { color: C.textSecondary, fontSize: 16, fontFamily: 'Nunito-Regular' },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary, fontFamily: 'Nunito-ExtraBold', marginBottom: 12 },
  desc: { color: C.textSecondary, fontSize: 15, marginBottom: 24, fontFamily: 'Nunito-Regular', lineHeight: 22 },
  input: {
    backgroundColor: C.bgSecondary, color: C.textPrimary,
    borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16,
    borderWidth: 1, borderColor: C.border,
  },
  button: {
    backgroundColor: C.accentRed, borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Nunito-Bold' },
  successText: { color: C.success, fontSize: 16, fontFamily: 'Nunito-Regular', lineHeight: 24 },
});
