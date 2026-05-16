import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import { authService } from '../../src/services/auth.service';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const s = styles(C);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60); // Kayıt sırasında backend zaten gönderdi
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Hata', e.response?.data?.message ?? 'Kod hatalı veya süresi dolmuş.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.sendVerification(email);
      setResendCooldown(60);
      Alert.alert('Gönderildi', 'Yeni doğrulama kodu e-postanıza gönderildi.');
    } catch {
      Alert.alert('Hata', 'Kod gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.inner}>
        <Text style={s.emoji}>📧</Text>
        <Text style={s.title}>E-posta Doğrulama</Text>
        <Text style={s.sub}>
          <Text style={{ color: C.accent }}>{email}</Text>
          {'\n'}adresine 6 haneli bir kod gönderdik.
        </Text>

        {/* Code inputs */}
        <View style={s.codeRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => { inputs.current[idx] = r; }}
              style={[s.codeInput, digit ? s.codeInputFilled : null]}
              value={digit}
              onChangeText={(v) => handleCodeChange(v, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[s.btn, loading && { opacity: 0.6 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Doğrula</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0} style={s.resend}>
          <Text style={[s.resendText, resendCooldown > 0 && { color: C.textMuted }]}>
            {resendCooldown > 0
              ? `Yeniden gönder (${resendCooldown}s)`
              : 'Kodu almadım, tekrar gönder'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={s.skip}>
          <Text style={s.skipText}>Şimdi değil, atla</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (C: ReturnType<typeof Colors[keyof typeof Colors]>) => StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: C.textPrimary, marginBottom: 10 },
  sub: { fontSize: 15, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  codeRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  codeInput: {
    width: 46, height: 56, borderRadius: 12,
    borderWidth: 2, borderColor: C.border,
    backgroundColor: C.bgCard,
    fontSize: 24, fontWeight: '700', color: C.textPrimary,
  },
  codeInputFilled: { borderColor: C.accent },
  btn: {
    backgroundColor: C.accent, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 40,
    width: '100%', alignItems: 'center', marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resend: { marginBottom: 12 },
  resendText: { fontSize: 14, color: C.accent, textDecorationLine: 'underline' },
  skip: { marginTop: 4 },
  skipText: { fontSize: 13, color: C.textMuted },
});
