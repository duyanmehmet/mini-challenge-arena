import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const BG    = '#ffffff';
const TEXT  = '#111827';
const MUTED = '#6b7280';
const PURP  = '#6c3aed';
const BORDER= '#f3f4f6';

const FAQ: { cat: string; icon: string; items: { q: string; a: string }[] }[] = [
  {
    cat: 'Hesap', icon: '👤',
    items: [
      { q: 'Şifremi unuttum, ne yapmalıyım?', a: 'Giriş ekranındaki "Şifremi Unuttum" butonuna bas. E-posta adresine sıfırlama linki gönderilecek.' },
      { q: 'Kullanıcı adımı değiştirebilir miyim?', a: 'Evet. Profil → Kalem ikonu → Kullanıcı Adını Değiştir bölümünden güncelleyebilirsin.' },
      { q: 'Hesabımı nasıl silebilirim?', a: 'Ayarlar → Hesabı Sil (KVKK) seçeneğiyle kalıcı olarak silebilirsin. Bu işlem geri alınamaz.' },
      { q: 'E-posta doğrulaması zorunlu mu?', a: 'Hayır, doğrulamadan da uygulamayı kullanabilirsin. Ancak şifre sıfırlama için e-posta doğrulaması gerekli.' },
    ],
  },
  {
    cat: 'Oyun', icon: '🎮',
    items: [
      { q: 'Lig canları ne zaman yenilenir?', a: 'Her 30 dakikada 1 can yenilenir. Maksimum 5 can taşıyabilirsin. Reklam izleyerek anında 1 can kazanabilirsin.' },
      { q: 'Günlük görevler ne zaman sıfırlanır?', a: 'Her gün gece yarısı (00:00) sıfırlanır ve yeni görevler gelir.' },
      { q: 'Coin nasıl kazanılır?', a: 'Oyun oynayarak, günlük giriş yaparak, günlük görevleri tamamlayarak ve düello kazanarak coin kazanabilirsin.' },
      { q: 'Joker nasıl kullanılır?', a: 'Oyun sırasında ekranın üstündeki joker butonlarına bas. 50:50 iki yanlış şıkkı eliyer, Değiştir soruyu değiştirir, Pas soruyu atlar.' },
      { q: 'Haftalık lig nasıl çalışır?', a: 'Her hafta Pazartesi sıfırlanır. Haftanın en yüksek skoruyla sıralanırsın. İlk %20 bir üst lige çıkar, son %20 düşer.' },
    ],
  },
  {
    cat: 'Teknik', icon: '🔧',
    items: [
      { q: 'Uygulama çöküyor veya donuyor.', a: 'Uygulamayı tamamen kapat ve yeniden aç. Sorun devam ederse uygulamayı sil ve yeniden yükle.' },
      { q: 'Puanım kaydedilmedi.', a: 'İnternet bağlantını kontrol et. Oyun sırasında bağlantı kesilirse puan kaydedilemeyebilir.' },
      { q: 'Bildirimler gelmiyor.', a: 'Telefon ayarları → Uygulamalar → Zeka Meydanı → Bildirimler bölümünden izni kontrol et.' },
    ],
  },
  {
    cat: 'Ödeme & VIP', icon: '💎',
    items: [
      { q: 'VIP ne kazandırır?', a: 'Reklamsız oyun, 2X XP kazanımı, özel VIP avatarları ve aylık bonus coin paketleri.' },
      { q: 'Satın aldığım coin hesabıma geçmedi.', a: 'Birkaç dakika bekle. Sorun devam ederse uygulamayı yeniden başlat. Hâlâ gelmiyorsa destek ekibimize ulaş.' },
      { q: 'İade talebinde bulunabilir miyim?', a: 'Google Play veya App Store üzerinden yapılan satın alımlar için ilgili mağazanın iade politikası geçerlidir.' },
    ],
  },
];

export default function HelpScreen() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backWrap}>
          <Text style={s.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>🙋 Yardım Merkezi</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.sub}>Sık sorulan sorular aşağıda. Cevap bulamazsan bize yaz.</Text>

        {FAQ.map(section => (
          <View key={section.cat} style={s.section}>
            <Text style={s.catTitle}>{section.icon} {section.cat}</Text>
            <View style={s.card}>
              {section.items.map((item, i) => {
                const key = `${section.cat}-${i}`;
                const isOpen = open === key;
                return (
                  <View key={key}>
                    {i > 0 && <View style={s.divider} />}
                    <TouchableOpacity style={s.row} onPress={() => setOpen(isOpen ? null : key)} activeOpacity={0.7}>
                      <Text style={s.question} numberOfLines={isOpen ? undefined : 2}>{item.q}</Text>
                      <Text style={[s.chevron, isOpen && { transform: [{ rotate: '90deg' }] }]}>›</Text>
                    </TouchableOpacity>
                    {isOpen && <Text style={s.answer}>{item.a}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Hâlâ yardım gerekiyor? */}
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>Hâlâ sorun mu var?</Text>
          <Text style={s.contactSub}>Destek ekibimiz size yardımcı olmaktan mutluluk duyar.</Text>
          <TouchableOpacity
            style={s.contactBtn}
            onPress={() => Linking.openURL('mailto:destek@minichallengearena.com?subject=Yardım%20Talebi')}
            activeOpacity={0.85}
          >
            <Text style={s.contactBtnTxt}>✉️  E-posta Gönder</Text>
          </TouchableOpacity>
        </View>
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

  section:  { paddingHorizontal: 16, marginBottom: 18 },
  catTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: TEXT, marginBottom: 10 },
  card:     { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  divider:  { height: 1, backgroundColor: BORDER },
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  question: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 14, color: TEXT, lineHeight: 20 },
  chevron:  { fontFamily: 'Nunito-Bold', fontSize: 20, color: MUTED },
  answer:   { fontFamily: 'Nunito-Regular', fontSize: 14, color: MUTED, paddingHorizontal: 16, paddingBottom: 14, lineHeight: 21 },

  contactCard: { marginHorizontal: 16, marginTop: 8, backgroundColor: PURP + '10', borderRadius: 18, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: PURP + '30' },
  contactTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT },
  contactSub:   { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED, textAlign: 'center' },
  contactBtn:   { backgroundColor: PURP, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28, marginTop: 4 },
  contactBtnTxt:{ fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#fff' },
});
