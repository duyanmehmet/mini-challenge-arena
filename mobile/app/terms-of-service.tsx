import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>Kullanım Şartları</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.updated}>Son güncelleme: 20 Mayıs 2026</Text>

        <Section title="1. Kabul">
          Zeka Meydanı uygulamasını indirerek veya kullanarak bu kullanım şartlarını kabul etmiş olursunuz. Şartları kabul etmiyorsanız uygulamayı kullanmayınız.
        </Section>

        <Section title="2. Hizmet Tanımı">
          Zeka Meydanı; bilgi yarışması, düello modu ve haftalık lig sistemi içeren bir mobil oyun uygulamasıdır. Uygulama iOS ve Android platformlarında ücretsiz olarak sunulmaktadır.
        </Section>

        <Section title="3. Hesap Oluşturma">
          • Hesap oluşturmak için geçerli bir e-posta adresi gereklidir{'\n'}
          • Kullanıcı adınız başkalarını yanıltıcı veya hakaret içerici olamaz{'\n'}
          • Hesap güvenliğiniz sizin sorumluluğunuzdadır{'\n'}
          • 13 yaşın altındaysanız hesap oluşturamazsınız
        </Section>

        <Section title="4. Kullanım Kuralları">
          Aşağıdaki davranışlar yasaktır:{'\n\n'}
          • Hile veya bot kullanımı{'\n'}
          • Diğer kullanıcılara hakaret veya taciz{'\n'}
          • Sistemin açıklarını istismar etmek{'\n'}
          • Birden fazla hesap oluşturmak{'\n'}
          • Uygulamayı tersine mühendislik yapmak
        </Section>

        <Section title="5. Sanal Para Birimi (Coin)">
          • Coin'ler uygulamanın içindeki sanal para birimidir{'\n'}
          • Gerçek para ile satın alınan coin'ler iade edilemez{'\n'}
          • Coin'lerin gerçek dünya değeri yoktur{'\n'}
          • Hesap silindiğinde tüm coin'ler kaybedilir
        </Section>

        <Section title="6. Fikri Mülkiyet">
          Uygulama içeriği, tasarımı ve kodu Zeka Meydanı'na aittir. İzinsiz kopyalanması veya dağıtılması yasaktır.
        </Section>

        <Section title="7. Sorumluluk Sınırlaması">
          Zeka Meydanı; hizmet kesintileri, veri kayıpları veya üçüncü taraf hizmetlerden kaynaklanan sorunlar için sorumluluk kabul etmez.
        </Section>

        <Section title="8. Hesap Askıya Alma">
          Kurallara aykırı davranış tespit edildiğinde hesabınız uyarı verilmeksizin askıya alınabilir veya silinebilir.
        </Section>

        <Section title="9. Değişiklikler">
          Bu şartlar zaman zaman güncellenebilir. Önemli değişiklikler uygulama bildirimiyle duyurulacaktır.
        </Section>

        <Section title="10. İletişim">
          Sorularınız için:{'\n'}
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
