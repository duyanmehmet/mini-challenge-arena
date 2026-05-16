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
import { CATEGORIES } from '../src/constants/categories';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
        socket.on('duel_invited', (data: { challengerId: string; mode: string; duelId: string }) => {
          const catName = CATEGORIES.find(c => c.id === data.mode)?.name ?? data.mode;
          Alert.alert(
            '⚔️ Düello Daveti!',
            `${catName} kategorisinde bir düello daveti aldın. Kabul ediyor musun?`,
            [
              { text: 'Reddet', style: 'cancel', onPress: () => socket.emit('duel_reject', { challengerId: data.challengerId }) },
              { text: 'Kabul Et', onPress: () => {
                socket.emit('duel_accept', { challengerId: data.challengerId });
              }},
            ]
          );
        });

        socket.on('duel_accepted', (data: { duelId: string; category?: string }) => {
          router.push(`/duel/${data.duelId}?cat=${data.category ?? 'general'}` as any);
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
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        {isOffline && (
          <View style={[s.offlineBanner, { backgroundColor: C.warning }]}>
            <Text style={s.offlineText}>📵 İnternet bağlantısı yok — çevrimdışı moddasınız</Text>
          </View>
        )}
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 280 }}>
          {/* Sekmeler */}
          <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 200 }} />

          {/* Auth & Onboarding */}
          <Stack.Screen name="(auth)" options={{ animation: 'fade', animationDuration: 300 }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade', animationDuration: 400 }} />

          {/* Oyun ekranları — aşağıdan yukarı (oyuna dalma hissi) */}
          <Stack.Screen name="game/[mode]"      options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', animationDuration: 350 }} />
          <Stack.Screen name="game/result"      options={{ animation: 'fade', animationDuration: 400 }} />
          <Stack.Screen name="game/select/[mode]" options={{ animation: 'slide_from_right', animationDuration: 250 }} />

          {/* Klasik & Canlı — büyük etki, aşağıdan */}
          <Stack.Screen name="classic"    options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', animationDuration: 350 }} />
          <Stack.Screen name="live"       options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', animationDuration: 350 }} />

          {/* Düello — rakiple karşılaşma anı */}
          <Stack.Screen name="duel/lobby"    options={{ animation: 'slide_from_right', animationDuration: 280 }} />
          <Stack.Screen name="duel/[duelId]" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', animationDuration: 400 }} />

          {/* İçerik ekranları — sağdan kayma */}
          <Stack.Screen name="stats"      options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="challenge"  options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="clan"       options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="battlepass" options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="tasks"      options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="settings"       options={{ headerShown: true, title: 'Ayarlar', animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="reset-password"   options={{ animation: 'fade', animationDuration: 300 }} />
          <Stack.Screen name="privacy-policy"   options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="terms-of-service" options={{ animation: 'slide_from_right', animationDuration: 260 }} />
        </Stack>
      </View>
    </ErrorBoundary>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  offlineBanner: { paddingVertical: 6, paddingHorizontal: 16, alignItems: 'center', zIndex: 999 },
  offlineText: { color: '#000', fontSize: 12, fontWeight: '600' },
});
