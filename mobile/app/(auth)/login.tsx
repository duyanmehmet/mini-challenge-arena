import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

import { authService } from '../../src/services/auth.service';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const GOOGLE_IOS_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

// Android'de SADECE Android client ID kullan — web client ID fallback yapma
const androidClientId = GOOGLE_ANDROID_CLIENT_ID || undefined;
const iosClientId     = GOOGLE_IOS_CLIENT_ID     || undefined;
const googleEnabled   = !!(GOOGLE_WEB_CLIENT_ID && (Platform.OS === 'ios' ? iosClientId : androidClientId || GOOGLE_WEB_CLIENT_ID));

const BG     = '#ffffff';
const CARD   = '#ffffff';
const INPUT  = '#f9fafb';
const BORDER = '#e5e7eb';
const PURP   = '#6c3aed';
const PURP2  = '#8b5cf6';
const TEXT   = '#111827';
const MUTED  = '#9ca3af';

const AVATARS = ['🐺', '🦊', '🐯', '🦁', '🐻', '🐼', '🦝', '🐨', '🦄', '🐲'];

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'mca',
    path: 'oauth',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     GOOGLE_WEB_CLIENT_ID || undefined,
    androidClientId: androidClientId,
    iosClientId:     iosClientId,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) handleGoogleSuccess(authentication.accessToken);
    } else if (response?.type === 'error') {
      Alert.alert(
        'Google Girişi Başarısız',
        'Google ile giriş şu an kullanılamıyor.\nE-posta ve şifrenizle giriş yapabilirsiniz.',
      );
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Eksik Bilgi', 'E-posta ve şifre giriniz.'); return;
    }
    setLoading(true);
    try {
      await authService.login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Giriş Başarısız', e.response?.data?.message ?? 'E-posta veya şifre yanlış.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Eksik Bilgi', 'Tüm alanlar zorunludur.'); return;
    }
    if (username.trim().length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalı.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.'); return;
    }
    setLoading(true);
    try {
      await authService.register(username.trim(), email.trim().toLowerCase(), password, avatarId);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Kayıt Başarısız', e.response?.data?.message ?? 'Tekrar dene.');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    setGoogleLoading(true);
    try {
      await authService.googleLogin(accessToken);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'Google ile giriş başarısız.');
    } finally { setGoogleLoading(false); }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setEmail(''); setPassword(''); setUsername('');
  };

  return (
    <View style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={s.header}>
            <View style={s.logoWrap}>
              <Text style={s.logoEmoji}>🧠</Text>
            </View>
            <Text style={s.brand}>ZEKA MEYDANI</Text>
            <Text style={s.title}>{mode === 'login' ? 'Hoş Geldin!' : 'Hesap Oluştur'}</Text>
            <Text style={s.sub}>
              {mode === 'login' ? 'Devam etmek için giriş yap.' : 'Ücretsiz, 1 dakikada hazır.'}
            </Text>
          </View>

          {/* Form */}
          <View style={s.form}>

            {mode === 'register' && (
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Kullanıcı Adı</Text>
                <TextInput
                  style={s.input}
                  placeholder="en az 3 karakter"
                  placeholderTextColor={MUTED}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
              </View>
            )}

            <View style={s.inputWrap}>
              <Text style={s.inputLabel}>E-posta</Text>
              <TextInput
                style={s.input}
                placeholder="ornek@mail.com"
                placeholderTextColor={MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.inputWrap}>
              <Text style={s.inputLabel}>Şifre</Text>
              <View style={s.passRow}>
                <TextInput
                  style={s.passInput}
                  placeholder={mode === 'register' ? 'en az 6 karakter' : '••••••••'}
                  placeholderTextColor={MUTED}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={mode === 'login' ? handleLogin : handleRegister}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
                  <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'login' && (
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={s.forgotRow}>
                <Text style={s.forgotText}>Şifremi Unuttum?</Text>
              </TouchableOpacity>
            )}

            {/* Avatar seçimi */}
            {mode === 'register' && (
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Avatar Seç</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                  {AVATARS.map((emoji, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[s.avatarItem, avatarId === i + 1 && s.avatarSelected]}
                      onPress={() => setAvatarId(i + 1)}
                    >
                      <Text style={{ fontSize: 26 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Ana Buton */}
            <TouchableOpacity
              style={[s.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.primaryBtnText}>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>veya</Text>
              <View style={s.divLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={[s.socialBtn, { opacity: googleLoading ? 0.6 : 1 }]}
              onPress={() => {
                if (!googleEnabled) {
                  Alert.alert('Yapılandırılmamış', 'Google girişi henüz aktif değil.\nE-posta ve şifrenizle giriş yapabilirsiniz.');
                  return;
                }
                promptAsync();
              }}
              disabled={googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading
                ? <ActivityIndicator color={TEXT} size="small" />
                : <>
                    <Text style={[s.socialIcon, { color: '#4285F4', fontFamily: 'Nunito-ExtraBold' }]}>G</Text>
                    <Text style={s.socialText}>Google ile Devam Et</Text>
                  </>
              }
            </TouchableOpacity>

            {/* Geçiş */}
            <TouchableOpacity onPress={switchMode} style={s.switchRow}>
              <Text style={s.switchText}>
                {mode === 'login' ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
                <Text style={s.switchLink}>
                  {mode === 'login' ? 'Kayıt Ol!' : 'Giriş Yap!'}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Gizlilik */}
            <View style={s.legalRow}>
              <TouchableOpacity onPress={() => router.push('/privacy-policy' as any)}>
                <Text style={s.legalLink}>Gizlilik Politikası</Text>
              </TouchableOpacity>
              <Text style={s.legalDot}>·</Text>
              <TouchableOpacity onPress={() => router.push('/terms-of-service' as any)}>
                <Text style={s.legalLink}>Kullanım Koşulları</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  // Header
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24 },
  logoWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#160d30',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: PURP2, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 20, elevation: 12,
    borderWidth: 1.5, borderColor: '#4c1d95',
  },
  logoEmoji: { fontSize: 48 },
  brand: {
    fontFamily: 'Nunito-ExtraBold', fontSize: 20,
    color: TEXT, letterSpacing: 3, marginBottom: 8,
  },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT, marginBottom: 6 },
  sub:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED, textAlign: 'center' },

  // Form
  form: { paddingHorizontal: 24 },
  inputWrap:  { marginBottom: 16 },
  inputLabel: { fontFamily: 'Nunito-Bold', fontSize: 12, color: MUTED, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: INPUT, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER,
    color: TEXT, fontFamily: 'Nunito-Regular', fontSize: 15,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  passRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: INPUT, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER, paddingRight: 12,
  },
  passInput: {
    flex: 1, color: TEXT, fontFamily: 'Nunito-Regular',
    fontSize: 15, paddingHorizontal: 16, paddingVertical: 14,
  },
  eyeBtn: { padding: 4 },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontFamily: 'Nunito-Regular', fontSize: 13, color: PURP2 },

  avatarItem: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: INPUT, borderWidth: 1.5, borderColor: BORDER, marginRight: 10,
  },
  avatarSelected: { borderColor: PURP2, backgroundColor: PURP + '33' },

  // Butonlar
  primaryBtn: {
    backgroundColor: PURP, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4, marginBottom: 20,
    shadowColor: PURP2, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  primaryBtnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: BORDER },
  divText: { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: CARD, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER,
    paddingVertical: 14, marginBottom: 12, gap: 10,
  },
  socialIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  socialText: { fontFamily: 'Nunito-Bold', fontSize: 15, color: TEXT },

  switchRow: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  switchText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },
  switchLink: { fontFamily: 'Nunito-ExtraBold', color: PURP2 },

  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 },
  legalLink: { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED },
  legalDot:  { color: MUTED, fontSize: 12 },
});
