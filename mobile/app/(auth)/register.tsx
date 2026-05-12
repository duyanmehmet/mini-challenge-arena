import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import { authService } from '../../src/services/auth.service';

const AVATARS = ['🐺','🦊','🐯','🦁','🐻','🐼','🦝','🐨','🦄','🐲'];

export default function RegisterScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur.');
      return;
    }
    if (username.length < 3 || username.length > 20) {
      Alert.alert('Hata', 'Kullanıcı adı 3-20 karakter olmalı.');
      return;
    }
    setLoading(true);
    try {
      // Backend registration logic might need to accept avatarId
      await authService.register(username, email, password, avatarId);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const s = styles(C);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>⚡</Text>
        <Text style={s.title}>Kayıt Ol</Text>

        <TextInput
          style={s.input}
          placeholder="Kullanıcı adı"
          placeholderTextColor={C.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={20}
        />
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

        <Text style={s.label}>Avatar Seç:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.avatarList}>
          {AVATARS.map((emoji, i) => (
            <TouchableOpacity 
              key={i} 
              style={[s.avatarItem, { borderColor: avatarId === i + 1 ? C.accentRed : C.border }]}
              onPress={() => setAvatarId(i + 1)}
            >
              <Text style={{ fontSize: 32 }}>{emoji}</Text>
              {avatarId === i + 1 && <View style={[s.selected, { backgroundColor: C.accentRed }]} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={s.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Hesap Oluştur</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.link}>Zaten hesabın var mı? <Text style={{ color: C.accentRed }}>Giriş yap</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPrimary },
  inner: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingVertical: 40 },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary, fontFamily: 'Nunito-ExtraBold', marginBottom: 24 },
  label: { width: '100%', color: C.textSecondary, fontFamily: 'Nunito-Bold', marginBottom: 8, fontSize: 14 },
  input: {
    width: '100%', backgroundColor: C.bgSecondary, color: C.textPrimary,
    borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16,
    borderWidth: 1, borderColor: C.border,
  },
  avatarList: { width: '100%', marginBottom: 24 },
  avatarItem: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginRight: 12, backgroundColor: C.bgSecondary },
  selected: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  link: { color: C.textSecondary, marginTop: 16, fontFamily: 'Nunito-Regular' },
  button: {
    width: '100%', backgroundColor: C.accentRed, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Nunito-Bold' },
});
