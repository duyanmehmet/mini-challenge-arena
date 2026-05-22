import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import api from '../src/services/api';

const BG    = '#ffffff';
const TEXT  = '#111827';
const MUTED = '#9ca3af';
const PURP  = '#6c3aed';
const BORDER= '#e5e7eb';

const CATEGORIES = [
  { id: 'bug',       label: '🐛 Hata Bildirimi' },
  { id: 'suggest',   label: '💡 Öneri' },
  { id: 'question',  label: '❓ Soru' },
  { id: 'complaint', label: '😞 Şikayet' },
  { id: 'other',     label: '💬 Diğer' },
];

const RATINGS = ['😡', '😕', '😐', '😊', '🤩'];

export default function FeedbackScreen() {
  const { user } = useUserStore();
  const [category, setCategory] = useState('suggest');
  const [rating,   setRating]   = useState(4);
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);

  const handleSend = async () => {
    if (message.trim().length < 10) {
      Alert.alert('Eksik', 'Lütfen en az 10 karakter gir.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/user/feedback', {
        category,
        rating: rating + 1,
        message: message.trim(),
      });
      setSent(true);
    } catch {
      // Backend endpoint yoksa e-posta fallback
      try {
        const subject = encodeURIComponent(`[${CATEGORIES.find(c => c.id === category)?.label ?? category}] Geri Bildirim`);
        const body    = encodeURIComponent(`Kullanıcı: ${user?.username ?? 'Bilinmiyor'}\nPuan: ${rating + 1}/5\n\n${message.trim()}`);
        const { Linking } = await import('react-native');
        await Linking.openURL(`mailto:destek@minichallengearena.com?subject=${subject}&body=${body}`);
        setSent(true);
      } catch {
        Alert.alert('Hata', 'Geri bildirim gönderilemedi. Lütfen tekrar dene.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.successWrap}>
          <Text style={{ fontSize: 72 }}>🎉</Text>
          <Text style={s.successTitle}>Teşekkürler!</Text>
          <Text style={s.successSub}>Geri bildirimin ulaştı. Uygulamamızı geliştirmek için her görüş bizim için çok değerli.</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={s.doneBtnTxt}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backWrap}>
          <Text style={s.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>💬 Geri Bildirim</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <Text style={s.sub}>Uygulamayı daha iyi yapabilmemiz için görüşlerini paylaş.</Text>

        {/* Konu */}
        <View style={s.section}>
          <Text style={s.label}>Konu</Text>
          <View style={s.catRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[s.catBtn, category === c.id && s.catBtnActive]}
                onPress={() => setCategory(c.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.catBtnTxt, category === c.id && { color: '#fff' }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Puanlama */}
        <View style={s.section}>
          <Text style={s.label}>Uygulamayı nasıl değerlendirirsin?</Text>
          <View style={s.ratingRow}>
            {RATINGS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                style={[s.ratingBtn, rating === i && s.ratingBtnActive]}
                onPress={() => setRating(i)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: rating === i ? 32 : 24 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.ratingLabel}>
            {['Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][rating]}
          </Text>
        </View>

        {/* Mesaj */}
        <View style={s.section}>
          <Text style={s.label}>Mesajın</Text>
          <TextInput
            style={s.textarea}
            placeholder="Deneyimini, önerini veya karşılaştığın sorunu yaz..."
            placeholderTextColor={MUTED}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={s.charCount}>{message.length}/1000</Text>
        </View>

        {/* Gönder */}
        <TouchableOpacity
          style={[s.sendBtn, loading && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.sendBtnTxt}>Gönder</Text>
          }
        </TouchableOpacity>

        <Text style={s.note}>Yanıt için {user?.email ?? 'kayıtlı e-postana'} geri dönüş yapılacak.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backWrap: {},
  backBtn:  { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: PURP, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title:    { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: TEXT },
  sub:      { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED, paddingHorizontal: 20, marginBottom: 20, lineHeight: 20 },

  section:  { paddingHorizontal: 16, marginBottom: 22 },
  label:    { fontFamily: 'Nunito-Bold', fontSize: 14, color: TEXT, marginBottom: 10 },

  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#f9fafb' },
  catBtnActive: { backgroundColor: PURP, borderColor: PURP },
  catBtnTxt: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#374151' },

  ratingRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 8 },
  ratingBtn:  { padding: 8, borderRadius: 12 },
  ratingBtnActive: { backgroundColor: PURP + '15' },
  ratingLabel: { fontFamily: 'Nunito-Bold', fontSize: 13, color: PURP, textAlign: 'center' },

  textarea:  { backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14, fontFamily: 'Nunito-Regular', fontSize: 15, color: TEXT, minHeight: 120, lineHeight: 22 },
  charCount: { fontFamily: 'Nunito-Regular', fontSize: 11, color: MUTED, textAlign: 'right', marginTop: 4 },

  sendBtn:    { marginHorizontal: 16, backgroundColor: PURP, borderRadius: 14, paddingVertical: 17, alignItems: 'center', shadowColor: PURP, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  sendBtnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' },
  note:       { fontFamily: 'Nunito-Regular', fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 14, paddingHorizontal: 24 },

  successWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  successTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: TEXT },
  successSub:   { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED, textAlign: 'center', lineHeight: 22 },
  doneBtn:      { backgroundColor: PURP, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48, marginTop: 8 },
  doneBtnTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#fff' },
});
