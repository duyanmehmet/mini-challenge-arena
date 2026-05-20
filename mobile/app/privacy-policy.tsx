import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>Gizlilik Politikası</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.updated}>Son güncelleme: 20 Mayıs 2026</Text>

        <Section title="1. Giriş">
          Zeka Meydanı uygulamasını kullandığınız için teşekkür ederiz. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
        </Section>

        <Section title="2. Toplanan Veriler">
          Uygulamamız aşağıdaki verileri toplar:{'\n\n'}
          • **Hesap bilgileri:** Kullanıcı adı, e-posta adresi ve şifrelenmiş parola{'\n'}
          • **Oyun verileri:** Puanlar, lig sıralaması, oynanan oyunlar ve başarımlar{'\n'}
          • **Cihaz bilgileri:** İşletim sistemi ve uygulama versiyonu{'\n'}
          • **Bildirim token'ı:** Anlık bildirim göndermek için
        </Section>

        <Section title="3. Verilerin Kullanımı">
          Topladığımız veriler şu amaçlarla kullanılır:{'\n\n'}
          • Hesabınızı oluşturmak ve yönetmek{'\n'}
          • Oyun deneyimini kişiselleştirmek{'\n'}
          • Lig sıralamalarını ve istatistikleri göstermek{'\n'}
          • Uygulama güvenliğini sağlamak{'\n'}
          • Hizmet kalitesini iyileştirmek
        </Section>

        <Section title="4. Veri Güvenliği">
          Verileriniz şifrelenerek güvenli sunucularda saklanmaktadır. Parolalar hiçbir zaman düz metin olarak saklanmaz; bcrypt algoritması ile şifrelenir.
        </Section>

        <Section title="5. Üçüncü Taraf Hizmetler">
          Uygulamamız aşağıdaki üçüncü taraf hizmetleri kullanmaktadır:{'\n\n'}
          • **Google AdMob:** Reklam gösterimi için{'\n'}
          • **Expo Push Notifications:** Bildirim servisi için{'\n\n'}
          Bu hizmetlerin kendi gizlilik politikaları mevcuttur.
        </Section>

        <Section title="6. Verilerin Saklanması">
          Hesabınız aktif olduğu sürece verileriniz saklanır. Hesabınızı silmek için ayarlar bölümünden "Hesabı Sil" seçeneğini kullanabilirsiniz.
        </Section>

        <Section title="7. Çocukların Gizliliği">
          Uygulamamız 13 yaşın altındaki çocuklara yönelik değildir. 13 yaş altı kullanıcılardan bilerek veri toplamamaktayız.
        </Section>

        <Section title="8. Haklarınız">
          KVKK kapsamında şu haklara sahipsiniz:{'\n\n'}
          • Verilerinize erişim hakkı{'\n'}
          • Verilerinizin düzeltilmesini talep etme hakkı{'\n'}
          • Verilerinizin silinmesini talep etme hakkı{'\n'}
          • Veri işlemeye itiraz hakkı
        </Section>

        <Section title="9. İletişim">
          Gizlilik politikamızla ilgili sorularınız için:{'\n'}
          duyanmehmet183@gmail.com
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionText}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#fff' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  back:    { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', backgroundColor: '#6c3aed', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, overflow: 'hidden' },
  title:   { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#111827' },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  updated: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af', marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#111827', marginBottom: 8 },
  sectionText:  { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#374151', lineHeight: 22 },
});
