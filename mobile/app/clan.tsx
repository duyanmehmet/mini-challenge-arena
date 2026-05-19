import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ClanScreen() {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backTxt}>← Geri</Text>
        </TouchableOpacity>
        <Text style={s.title}>🛡️ Klanlar</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={s.center}>
        <Text style={{ fontSize: 72 }}>🏰</Text>
        <Text style={s.comingSoon}>Çok Yakında!</Text>
        <Text style={s.sub}>
          Klan sistemi şu an devre dışı.{'\n'}
          Daha büyük bir toplulukla birlikte{'\n'}
          yakında geri dönecek!
        </Text>
        <TouchableOpacity style={s.btn} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.btnTxt}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0d0d1a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#2e2b5a' },
  backBtn: { width: 60 },
  backTxt: { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#7c7aaa' },
  title:   { fontFamily: 'Nunito-ExtraBold', fontSize: 20, color: '#ffffff' },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  comingSoon: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: '#8b5cf6' },
  sub:     { fontFamily: 'Nunito-Regular', fontSize: 15, color: '#7c7aaa', textAlign: 'center', lineHeight: 24 },
  btn:     { backgroundColor: '#6c3aed', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  btnTxt:  { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: '#ffffff' },
});
