import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';
import { Colors } from '../src/constants/colors';

export default function TermsOfServiceScreen() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const s = styles(C);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: C.textSecondary }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: C.textPrimary }]}>Kullanım Koşulları</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.updated, { color: C.textSecondary }]}>Son güncelleme: Mayıs 2026</Text>

        <Section title="1. Kabul" C={C}>
          Zeka Meydanı uygulamasını kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız. Kabul etmiyorsanız uygulamayı kullanmayınız.
        </Section>

        <Section title="2. Hesap" C={C}>
          Hesabınızı güvenli tutmaktan siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın. Hesabınızda gerçekleşen tüm işlemler size aittir.
        </Section>

        <Section title="3. Yasak Kullanımlar" C={C}>
          Uygulamayı; hile yazılımı, bot veya otomatik araçlarla kullanmak, başka kullanıcıları taciz etmek, sistemin güvenliğini tehdit eden eylemler gerçekleştirmek kesinlikle yasaktır. İhlal durumunda hesabınız askıya alınır.
        </Section>

        <Section title="4. Sanal Para (Coin)" C={C}>
          Uygulama içi coin'ler gerçek parayla satın alınabilir. Coin'lerin gerçek para karşılığı yoktur, iade edilemez. Hesap silindiğinde coin bakiyesi sıfırlanır.
        </Section>

        <Section title="5. Fikri Mülkiyet" C={C}>
          Uygulama içeriği, tasarım, logo ve soru bankası Zeka Meydanı'na aittir. İzinsiz kopyalanamaz, dağıtılamaz.
        </Section>

        <Section title="6. Sorumluluk Sınırı" C={C}>
          Zeka Meydanı, hizmet kesintisi, veri kaybı veya kullanıcı hataları nedeniyle oluşan zararlardan sorumlu değildir.
        </Section>

        <Section title="7. Değişiklikler" C={C}>
          Bu koşullar önceden bildirmeksizin güncellenebilir. Güncel koşullara uygulama üzerinden erişilebilir.
        </Section>

        <Section title="8. İletişim" C={C}>
          Sorularınız için: destek@zekameydani.com
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
