import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useSettingsStore } from '../src/store/settingsStore';
import { useUserStore } from '../src/store/userStore';
import { Colors } from '../src/constants/colors';
import { socketService } from '../src/services/socket.service';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { notificationService } from '../src/services/notification.service';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Medium': Nunito_500Medium,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
  });

  const { theme } = useSettingsStore();
  const { isAuthenticated, loadAuth } = useUserStore();
  const [authLoaded, setAuthLoaded] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Auth yükle — internet yoksa cached data kullan, bloklama
    loadAuth().finally(() => setAuthLoaded(true));
  }, []);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        const token = await notificationService.registerForPushNotificationsAsync();
        if (token) console.log('Push Token:', token);
        await notificationService.scheduleDailyReminder();
      } catch (err) {
        console.log('Notification error:', err);
      }
    };
    initNotifications();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = socketService.connect();
      if (socket) {
        socket.on('duel_invited', (data: { challengerId: string; mode: string }) => {
          Alert.alert(
            'Düello Daveti!',
            `${data.mode} modunda bir düello daveti aldın. Kabul ediyor musun?`,
            [
              { text: 'Reddet', style: 'cancel' },
              { text: 'Kabul Et', onPress: () => {
                socket.emit('duel_accept', { challengerId: data.challengerId, mode: data.mode });
              }},
            ]
          );
        });

        socket.on('duel_accepted', (data: { duelId: string }) => {
          router.push(`/duel/${data.duelId}` as any);
        });

        // Canlı yarışma bildirimleri
        socket.on('live_tournament_soon', (data: { message: string; minutesLeft: number }) => {
          Alert.alert('🏟️ Canlı Yarışma!', data.message, [
            { text: 'Tamam' },
            { text: 'Şimdi Git', onPress: () => router.push('/live' as any) },
          ]);
        });

        socket.on('live_tournament_start', () => {
          Alert.alert('🔴 Yarışma Başladı!', 'Canlı yarışma şu an aktif! Katılmak ister misin?', [
            { text: 'Sonra' },
            { text: 'Katıl!', onPress: () => router.push('/live' as any) },
          ]);
        });
      }
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  useEffect(() => {
    if (loaded && authLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, authLoaded]);

  useEffect(() => {
    if (!authLoaded || !loaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (isAuthenticated) {
      if (inAuthGroup || inOnboarding) {
        router.replace('/(tabs)');
      }
      return;
    }

    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      AsyncStorage.getItem('onboarding_complete').then((done) => {
        if (done === 'true') {
          router.replace('/(auth)/login');
        } else {
          router.replace('/onboarding' as any);
        }
      });
    }
  }, [isAuthenticated, authLoaded, loaded, segments]);


  if (!loaded || !authLoaded) {
    return null;
  }

  const C = Colors[theme];

  return (
    <SafeAreaProvider>
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        {isOffline && (
          <View style={[s.offlineBanner, { backgroundColor: C.warning }]}>
            <Text style={s.offlineText}>📵 İnternet bağlantısı yok — çevrimdışı moddasınız</Text>
          </View>
        )}
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="game/[mode]" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="game/result" />
          <Stack.Screen name="game/select/[mode]" />
          <Stack.Screen name="settings" options={{ headerShown: true, title: 'Ayarlar' }} />
          <Stack.Screen name="stats" options={{ headerShown: false }} />
          <Stack.Screen name="challenge" options={{ headerShown: false }} />
          <Stack.Screen name="classic" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="duel/lobby" options={{ headerShown: false }} />
          <Stack.Screen name="duel/[duelId]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="live" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="clan" options={{ headerShown: false }} />
          <Stack.Screen name="battlepass" options={{ headerShown: false }} />
        </Stack>
      </View>
    </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  offlineBanner: { paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center', zIndex: 999 },
  offlineText: { color: '#000', fontSize: 12, fontWeight: '600' },
});
