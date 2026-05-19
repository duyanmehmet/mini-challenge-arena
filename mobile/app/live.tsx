import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

// Canlı Turnuva kaldırıldı — ana sayfaya yönlendir
export default function LiveRedirect() {
  useEffect(() => { router.replace('/(tabs)' as any); }, []);
  return <View style={{ flex: 1, backgroundColor: '#0d0d1a' }} />;
}
