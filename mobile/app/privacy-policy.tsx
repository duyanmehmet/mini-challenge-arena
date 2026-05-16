import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { Colors } from '../src/constants/colors';

export default function PrivacyPolicyScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>Gizlilik Politikası</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.updated, { color: C.textSecondary }]}>Son güncelleme: Mayıs 2026</Text>

        <Section title="1. Toplanan Veriler" C={C}>
          Zeka Meydanı uygulaması; kullanıcı adı, e-posta adresi ve oyun skorları gibi temel bilgileri toplar. Bu veriler yalnızca hizmetin sunulması amacıyla kullanılır.
        </Section>

        <Section title="2. Verilerin Kullanımı" C={C}>
          Toplanan veriler; hesap yönetimi, liderlik tablosu görüntüleme ve günlük görev takibi için kullanılır. Üçüncü taraflarla hiçbir koşulda satılmaz veya paylaşılmaz.
        </Section>

        <Section title="3. Veri Güvenliği" C={C}>
          Şifreler bcrypt ile hashlenerek saklanır. Tüm API iletişimi HTTPS üzerinden gerçekleştirilir. JWT token'ları 30 günlük süre sonunda geçersiz hale gelir.
        </Section>

        <Section title="4. Çerezler ve Yerel Depolama" C={C}>
          Uygulama, oturum bilgilerini cihazınızdaki güvenli depolama alanında (AsyncStorage) saklar. Bu veriler yalnızca cihazınızda tutulur, dışarıya aktarılmaz.
        </Section>

        <Section title="5. Reklam" C={C}>
          Uygulama, Google AdMob aracılığıyla reklam gösterebilir. Premium kullanıcılar reklamlardan muaftır. AdMob gizlilik politikası için Google'ın web sitesini ziyaret edin.
        </Section>

        <Section title="6. Hesap Silme" C={C}>
          Hesabınızı Ayarlar ekranından silebilirsiniz. Silme işlemi geri alınamaz ve tüm verileriniz kalıcı olarak silinir. Bu hak KVKK kapsamında güvence altındadır.
        </Section>

        <Section title="7. İletişim" C={C}>
          Gizlilik ile ilgili sorularınız için: destek@zekameydani.com
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, C }: { title: string; children: string; C: any }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 15, color: C.textPrimary, marginBottom: 6 }}>{title}</Text>
      <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 14, color: C.textSecondary, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}

const styles = (C: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { fontFamily: 'Nunito-Regular', fontSize: 15 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 18 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  updated: { fontFamily: 'Nunito-Regular', fontSize: 12, marginBottom: 20 },
});
