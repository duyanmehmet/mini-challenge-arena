import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

// Antrenman modu bu işlevi devraldı
export default function KategorilerRedirect() {
  useEffect(() => { router.replace('/antrenman' as any); }, []);
  return <View style={{ flex: 1, backgroundColor: '#0d0d1a' }} />;
}
