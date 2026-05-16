import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  Animated, ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import { authService } from '../../src/services/auth.service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATARS = ['🐺', '🦊', '🐯', '🦁', '🐻', '🐼', '🦝', '🐨', '🦄', '🐲'];

type Mode = 'welcome' | 'login' | 'register';

export default function AuthScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];

  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const goTo = (next: Mode) => {
    Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setMode(next);
      Animated.spring(slideAnim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }).start();
    });
  };

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
      Alert.alert('Eksik Bilgi', 'Tüm alanlar zorunludur.');
      return;
    }
    if (username.trim().length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalı.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    try {
      await authService.register(username.trim(), email.trim().toLowerCase(), password, avatarId);
      // Email doğrulama ekranına yönlendir
      router.replace({ pathname: '/(auth)/verify-email', params: { email: email.trim().toLowerCase() } });
    } catch (e: any) {
      Alert.alert('Kayıt Başarısız', e.response?.data?.message ?? 'Tekrar dene.');
    } finally { setLoading(false); }
  };

  const s = styles(C);

  // ── KARŞILAMA ─────────────────────────────────────────────────────
  if (mode === 'welcome') {
    return (
      <View style={[s.root, { backgroundColor: C.bgPrimary }]}>
        {/* Üst dekorasyon */}
        <View style={[s.topBlob, { backgroundColor: '#e94560' }]} />

        <Animated.View style={[s.welcomeContent, { opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) ?? 1 }]}>
          {/* Logo + İsim */}
          <View style={s.logoRow}>
            <Text style={s.logoEmoji}>🏆</Text>
          </View>
          <Text style={[s.appName, { color: C.textPrimary }]}>Bil Bakalım</Text>
          <Text style={[s.tagline, { color: C.textSecondary }]}>
            Türkiye'nin bilgi yarışması uygulaması
          </Text>

          {/* Kategoriler önizleme */}
          <View style={s.catRow}>
            {['🏺 Tarih', '🌍 Coğrafya', '🔬 Bilim', '🇹🇷 Türkiye', '🎬 Sinema', '⚽ Spor'].map((c) => (
              <View key={c} style={[s.catChip, { backgroundColor: C.bgSecondary }]}>
                <Text style={[s.catChipText, { color: C.textPrimary }]}>{c}</Text>
              </View>
            ))}
          </View>

          {/* Butonlar */}
          <View style={s.btnGroup}>
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: '#e94560' }]}
              onPress={() => goTo('register')}
              activeOpacity={0.85}
            >
              <Text style={s.primaryBtnText}>🚀 Hesap Oluştur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.secondaryBtn, { borderColor: C.border, backgroundColor: C.bgSecondary }]}
              onPress={() => goTo('login')}
              activeOpacity={0.85}
            >
              <Text style={[s.secondaryBtnText, { color: C.textPrimary }]}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  // ── GİRİŞ FORMU ────────────────────────────────────────────────────
  if (mode === 'login') {
    return (
      <KeyboardAvoidingView
        style={[s.root, { backgroundColor: C.bgPrimary }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={s.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Geri */}
          <TouchableOpacity onPress={() => goTo('welcome')} style={s.backBtn}>
            <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
          </TouchableOpacity>

          <Text style={s.logoEmoji}>🏆</Text>
          <Text style={[s.formTitle, { color: C.textPrimary }]}>Tekrar Hoş Geldin!</Text>
          <Text style={[s.formSub, { color: C.textSecondary }]}>Hesabına giriş yap</Text>

          <View style={s.fieldGroup}>
            <Text style={[s.fieldLabel, { color: C.textSecondary }]}>E-posta</Text>
            <TextInput
              style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
              placeholder="ornek@mail.com"
              placeholderTextColor={C.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={s.fieldGroup}>
            <Text style={[s.fieldLabel, { color: C.textSecondary }]}>Şifre</Text>
            <View style={[s.passwordRow, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
              <TextInput
                style={[s.passwordInput, { color: C.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={C.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
            <Text style={[s.forgotText, { color: '#e94560' }]}>Şifremi unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: '#e94560', opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryBtnText}>Giriş Yap</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => goTo('register')} style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={[s.switchText, { color: C.textSecondary }]}>
              Hesabın yok mu? <Text style={{ color: '#e94560', fontFamily: 'Nunito-Bold' }}>Kayıt ol</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── KAYIT FORMU ─────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={s.formScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => goTo('welcome')} style={s.backBtn}>
          <Text style={[s.backText, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>

        <Text style={s.logoEmoji}>🏆</Text>
        <Text style={[s.formTitle, { color: C.textPrimary }]}>Hesap Oluştur</Text>
        <Text style={[s.formSub, { color: C.textSecondary }]}>Ücretsiz, 1 dakikada hazır</Text>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: C.textSecondary }]}>Kullanıcı Adı</Text>
          <TextInput
            style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
            placeholder="bilge_kus42"
            placeholderTextColor={C.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            returnKeyType="next"
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: C.textSecondary }]}>E-posta</Text>
          <TextInput
            style={[s.input, { backgroundColor: C.bgSecondary, color: C.textPrimary, borderColor: C.border }]}
            placeholder="ornek@mail.com"
            placeholderTextColor={C.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: C.textSecondary }]}>Şifre</Text>
          <View style={[s.passwordRow, { backgroundColor: C.bgSecondary, borderColor: C.border }]}>
            <TextInput
              style={[s.passwordInput, { color: C.textPrimary }]}
              placeholder="En az 6 karakter"
              placeholderTextColor={C.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar seçimi */}
        <Text style={[s.fieldLabel, { color: C.textSecondary, marginBottom: 8 }]}>Avatar Seç</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {AVATARS.map((emoji, i) => {
            const selected = avatarId === i + 1;
            return (
              <TouchableOpacity
                key={i}
                style={[s.avatarItem, {
                  borderColor: selected ? '#e94560' : C.border,
                  backgroundColor: selected ? '#e9456022' : C.bgSecondary,
                }]}
                onPress={() => setAvatarId(i + 1)}
              >
                <Text style={{ fontSize: 30 }}>{emoji}</Text>
                {selected && <View style={s.avatarDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: '#e94560', opacity: loading ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.primaryBtnText}>🚀 Hesap Oluştur</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => goTo('login')} style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={[s.switchText, { color: C.textSecondary }]}>
            Zaten hesabın var mı? <Text style={{ color: '#e94560', fontFamily: 'Nunito-Bold' }}>Giriş yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (C: typeof Colors.dark) => StyleSheet.create({
  root: { flex: 1 },

  // Karşılama
  topBlob: { position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, opacity: 0.15 },
  welcomeContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  logoRow: { alignItems: 'center', marginBottom: 12 },
  logoEmoji: { fontSize: 72, textAlign: 'center', marginBottom: 8 },
  appName: { fontSize: 32, fontFamily: 'Nunito-ExtraBold', textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 15, fontFamily: 'Nunito-Regular', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36 },
  catChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  catChipText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
  btnGroup: { gap: 12 },
  primaryBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontFamily: 'Nunito-ExtraBold', fontSize: 17 },
  secondaryBtn: { borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1.5 },
  secondaryBtnText: { fontFamily: 'Nunito-Bold', fontSize: 16 },

  // Form
  formScroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 56, paddingBottom: 40 },
  backBtn: { marginBottom: 24 },
  backText: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  formTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, marginBottom: 6 },
  formSub: { fontFamily: 'Nunito-Regular', fontSize: 15, marginBottom: 28 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 14, padding: 16, fontSize: 16, borderWidth: 1.5, fontFamily: 'Nunito-Regular' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, paddingRight: 12 },
  passwordInput: { flex: 1, padding: 16, fontSize: 16, fontFamily: 'Nunito-Regular' },
  eyeBtn: { padding: 4 },
  forgotText: { fontFamily: 'Nunito-Regular', fontSize: 14 },
  switchText: { fontFamily: 'Nunito-Regular', fontSize: 14 },
  avatarItem: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginRight: 10 },
  avatarDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#e94560', borderWidth: 2, borderColor: '#fff' },
});
