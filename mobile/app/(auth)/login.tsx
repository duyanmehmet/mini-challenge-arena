import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { authService } from '../../src/services/auth.service';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '74921537013-lr1636vf8ljjho8t63alr6dcolm4pg1o.apps.googleusercontent.com';

const { width } = Dimensions.get('window');

const BG     = '#ffffff';
const CARD   = '#ffffff';
const INPUT  = '#f9fafb';
const BORDER = '#e5e7eb';
const PURP   = '#6c3aed';
const PURP2  = '#8b5cf6';
const TEXT   = '#111827';
const MUTED  = '#9ca3af';
const LAVAND = '#a78bfa';

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

  // Google OAuth — redirect URI Google Cloud Console'daki ile birebir aynı olmalı
  const redirectUri = 'https://auth.expo.io/@duyanmehmet/zekameydani';

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    iosClientId:     GOOGLE_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleSuccess(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Hata', 'Google ile giriş başarısız.');
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Eksik Bilgi', 'E-posta ve şifre giriniz.');
      return;
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
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setEmail(''); setPassword(''); setUsername('');
  };

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header: Beyin + Marka ── */}
          <View style={s.header}>
            <View style={s.iconRing}>
              <Text style={s.iconEmoji}>🧠</Text>
            </View>
            <Text style={s.brandTitle}>ZEKA MEYDANI</Text>
            <Text style={s.welcome}>
              {mode === 'login' ? 'Hoş Geldin!' : 'Hesap Oluştur'}
            </Text>
            <Text style={s.sub}>
              {mode === 'login'
                ? 'Devam etmek için giriş yap.'
                : 'Ücretsiz, 1 dakikada hazır.'}
            </Text>
          </View>

          {/* ── Form Alanı ── */}
          <View style={s.form}>

            {/* Kullanıcı adı (yalnızca kayıt) */}
            {mode === 'register' && (
              <TextInput
                style={s.input}
                placeholder="Kullanıcı Adı"
                placeholderTextColor={MUTED}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            )}

            {/* E-posta */}
            <TextInput
              style={s.input}
              placeholder="E-posta"
              placeholderTextColor={MUTED}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Şifre */}
            <View style={s.passRow}>
              <TextInput
                style={s.passInput}
                placeholder="Şifre"
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

            {/* Şifremi Unuttum */}
            {mode === 'login' && (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={s.forgotRow}
              >
                <Text style={s.forgotText}>Şifremi Unuttum?</Text>
              </TouchableOpacity>
            )}

            {/* Avatar seçimi (kayıt) */}
            {mode === 'register' && (
              <>
                <Text style={s.avatarLabel}>Avatar Seç</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {AVATARS.map((emoji, i) => {
                    const selected = avatarId === i + 1;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[s.avatarItem, selected && s.avatarSelected]}
                        onPress={() => setAvatarId(i + 1)}
                      >
                        <Text style={{ fontSize: 28 }}>{emoji}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
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
                : <Text style={s.primaryBtnText}>
                    {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                  </Text>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>veya</Text>
              <View style={s.divLine} />
            </View>

            {/* Sosyal Giriş */}
            <TouchableOpacity
              style={[s.socialBtn, (!request || googleLoading) && { opacity: 0.6 }]}
              onPress={() => promptAsync()}
              disabled={!request || googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading
                ? <ActivityIndicator color={TEXT} size="small" />
                : <>
                    <Text style={s.socialIcon}>G</Text>
                    <Text style={s.socialText}>Google ile Devam Et</Text>
                  </>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={s.socialBtn}
              onPress={() => Alert.alert('Yakında', 'Apple ile giriş çok yakında!')}
              activeOpacity={0.8}
            >
              <Text style={s.socialIcon}></Text>
              <Text style={s.socialText}>Apple ile Devam Et</Text>
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

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 28,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1a1040',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: '#4c1d95',
  },
  iconEmoji: { fontSize: 52 },
  brandTitle: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 22,
    color: TEXT,
    letterSpacing: 4,
    marginBottom: 6,
  },
  welcome: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 20,
    color: TEXT,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: MUTED,
  },

  // ── Form ──
  form: {
    paddingHorizontal: 28,
  },
  input: {
    backgroundColor: INPUT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    color: TEXT,
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
    paddingRight: 12,
  },
  passInput: {
    flex: 1,
    color: TEXT,
    fontFamily: 'Nunito-Regular',
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  eyeBtn: { padding: 4 },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 22, marginTop: 4 },
  forgotText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: LAVAND,
  },

  avatarLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: MUTED,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INPUT,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginRight: 10,
  },
  avatarSelected: {
    borderColor: PURP2,
    backgroundColor: PURP + '33',
  },

  // ── Butonlar ──
  primaryBtn: {
    backgroundColor: PURP,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: PURP2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
  },
  primaryBtnText: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 17,
    color: '#fff',
  },

  // ── Divider ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  divLine: { flex: 1, height: 1, backgroundColor: BORDER },
  divText: { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED },

  // ── Sosyal ──
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 15,
    marginBottom: 12,
    gap: 10,
  },
  socialIcon: {
    fontSize: 18,
    color: TEXT,
    fontFamily: 'Nunito-ExtraBold',
    width: 24,
    textAlign: 'center',
  },
  socialText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: TEXT,
  },

  // ── Geçiş ──
  switchRow: { alignItems: 'center', marginTop: 8 },
  switchText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: MUTED,
  },
  switchLink: {
    fontFamily: 'Nunito-ExtraBold',
    color: LAVAND,
  },
});
