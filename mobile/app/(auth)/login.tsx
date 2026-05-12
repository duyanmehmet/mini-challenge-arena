import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import { authService } from '../../src/services/auth.service';


export default function LoginScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre gerekli.');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };


  const s = styles(C);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>⚡</Text>
        <Text style={s.title}>Mini Challenge Arena</Text>
        <Text style={s.subtitle}>Giriş Yap</Text>

        <TextInput
          style={s.input}
          placeholder="E-posta"
          placeholderTextColor={C.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={s.input}
          placeholder="Şifre"
          placeholderTextColor={C.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={s.link}>Şifremi unuttum</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Giriş Yap</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={s.link}>Hesabın yok mu? <Text style={{ color: C.accentRed }}>Kayıt ol</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary, fontFamily: 'Nunito-ExtraBold', marginBottom: 4 },
  subtitle: { fontSize: 18, color: C.textSecondary, fontFamily: 'Nunito-Regular', marginBottom: 32 },
  input: {
    width: '100%', backgroundColor: C.bgSecondary, color: C.textPrimary,
    borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16,
    borderWidth: 1, borderColor: C.border,
  },
  link: { color: C.textSecondary, marginVertical: 8, fontFamily: 'Nunito-Regular' },
  button: {
    width: '100%', backgroundColor: C.accentRed, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Nunito-Bold' },
});
