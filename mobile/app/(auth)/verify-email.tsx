import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '../../src/services/auth.service';

const BG    = '#ffffff';
const CARD  = '#ffffff';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const BORDER= '#e5e7eb';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code,    setCode]    = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Profil'den gelince 0'dan başla
  const inputs = useRef<(TextInput | null)[]>([]);

  // Mount olunca otomatik kod gönder
  useEffect(() => {
    if (!email) return;
    sendCode();
  }, []);

  // Cooldown sayacı
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async () => {
    if (!email || cooldown > 0) return;
    setSending(true);
    try {
      await authService.sendVerification(email);
      setCooldown(60);
    } catch {
      Alert.alert('Hata', 'Kod gönderilemedi. E-posta adresini kontrol et.');
    } finally {
      setSending(false);
    }
  };

  const handleCodeChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      Alert.alert('Eksik', '6 haneli kodu eksiksiz girin.');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyEmail(email, fullCode);
      Alert.alert('✅ Doğrulandı!', 'E-posta adresin başarıyla doğrulandı.', [
        { text: 'Harika!', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'Kod hatalı veya süresi dolmuş.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backTxt}>← Geri</Text>
      </TouchableOpacity>


      <View style={s.inner}>
        <Text style={s.emoji}>📧</Text>
        <Text style={s.title}>E-posta Doğrulama</Text>

        {sending ? (
          <View style={s.sendingRow}>
            <ActivityIndicator color={PURP2} size="small" />
            <Text style={s.sendingTxt}>Kod gönderiliyor...</Text>
          </View>
        ) : (
          <Text style={s.sub}>
            <Text style={{ color: PURP2 }}>{email}</Text>
            {'\n'}adresine 6 haneli kod gönderdik.
          </Text>
        )}

        {/* 6 kutucuk */}
        <View style={s.codeRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={r => { inputs.current[idx] = r; }}
              style={[s.codeInput, digit ? s.codeInputFilled : null]}
              value={digit}
              onChangeText={v => handleCodeChange(v, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        {/* Doğrula Butonu */}
        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.6 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Doğrula</Text>}
        </TouchableOpacity>

        {/* Tekrar Gönder */}
        <TouchableOpacity
          onPress={sendCode}
          disabled={cooldown > 0 || sending}
          style={s.resend}
        >
          <Text style={[s.resendText, cooldown > 0 && { color: MUTED }]}>
            {cooldown > 0
              ? `Tekrar gönder (${cooldown}s)`
              : 'Kodu almadım, tekrar gönder'}
          </Text>
        </TouchableOpacity>

        {/* Atla */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={s.skip}>
          <Text style={s.skipText}>Şimdi değil, atla</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  backBtn: { marginHorizontal: 16, marginTop: 12, alignSelf: 'flex-start', backgroundColor: PURP, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  backTxt: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },

  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 26, color: TEXT, marginBottom: 12 },
  sub:   { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  sendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  sendingTxt: { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED },

  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  codeInput: {
    width: 48, height: 58, borderRadius: 14,
    borderWidth: 2, borderColor: BORDER,
    backgroundColor: CARD,
    fontSize: 24, fontFamily: 'Nunito-ExtraBold', color: TEXT,
  },
  codeInputFilled: { borderColor: PURP2 },

  btn: {
    backgroundColor: PURP, borderRadius: 14,
    paddingVertical: 17, width: '100%', alignItems: 'center', marginBottom: 16,
    shadowColor: PURP2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  btnText: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' },

  resend: { marginBottom: 12 },
  resendText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: PURP2, textDecorationLine: 'underline' },

  skip: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 24 },
  skipText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: MUTED },
});
