import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

// Klasik Tur → Lig sistemiyle değiştirildi
export default function ClassicRedirect() {
  useEffect(() => { router.replace('/lig' as any); }, []);
  return <View style={{ flex: 1, backgroundColor: '#0d0d1a' }} />;
}
