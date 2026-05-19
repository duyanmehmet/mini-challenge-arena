import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

// Tab bar'daki merkez "Oyna" butonunun placeholder ekranıdır.
// tabBarButton ile override edildiği için bu ekran hiç render edilmez.
export default function StorePlaceholder() {
  useEffect(() => { router.replace('/lig' as any); }, []);
  return <View style={{ flex: 1, backgroundColor: '#0d0d1a' }} />;
}
