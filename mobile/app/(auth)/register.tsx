// Kayıt akışı login.tsx içine taşındı — bu dosya oraya yönlendirir
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function RegisterRedirect() {
  useEffect(() => {
    router.replace('/(auth)/login');
  }, []);
  return null;
}
