import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
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
import { Alert, View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SplashScreenView } from '../src/components/ui/SplashScreenView';
import { DailyLoginModal } from '../src/components/ui/DailyLoginModal';
import { CATEGORIES } from '../src/constants/categories';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { notificationService } from '../src/services/notification.service';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';
import { seenQuestionsService } from '../src/services/seenQuestionsService';

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
  const { isAuthenticated, loadAuth, streakGoal, setStreakGoal } = useUserStore();
  const [authLoaded, setAuthLoaded]   = useState(false);
  const [isOffline,  setIsOffline]    = useState(false);
  const [dailyReward, setDailyReward] = useState<{ coins: number; streak: number } | null>(null);
  const [showStreakGoalModal, setShowStreakGoalModal] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const notifResponseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Auth yükle — internet yoksa cached data kullan, bloklama
    loadAuth().finally(() => setAuthLoaded(true));
    // Dünün "görülen sorular" kayıtlarını temizle
    seenQuestionsService.clearOldEntries();
  }, []);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return unsub;
  }, []);

  // Bildirime tıklanınca ilgili ekrana git
  useEffect(() => {
    notifResponseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      if (!data?.type) return;
      switch (data.type) {
        case 'daily_reminder':
        case 'weekly_reset':
          router.push('/(tabs)');
          break;
        case 'streak_warning':
          router.push('/streak' as any);
          break;
        case 'duel_invite':
          if (data.duelId) router.push(`/duel/${data.duelId}` as any);
          break;
      }
    });
    return () => notifResponseListener.current?.remove();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !authLoaded) return;
    AsyncStorage.getItem('streakGoalAsked').then((asked) => {
      if (!asked) setShowStreakGoalModal(true);
    });
  }, [isAuthenticated, authLoaded]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Profil senkronizasyonu — avatarId ve diğer sunucu verilerini tazele
    import('../src/services/user.service').then(({ userService }) => {
      userService.getProfile().then(data => {
        const store = useUserStore.getState();
        store.updateUser(data.user);
        store.setBadges(data.badges);
        store.setPersonalBests(data.personalBests);
      }).catch(() => {});
    });

    const initNotifications = async () => {
      try {
        const token = await notificationService.registerForPushNotificationsAsync();
        if (token) console.log('[Push] Token kaydedildi');
        await notificationService.scheduleDailyReminder();
      } catch {}
    };
    initNotifications();

    // Günlük giriş ödülü
    import('../src/services/api').then(({ default: api }) => {
      api.post('/user/daily-login').then(r => {
        if (!r.data.alreadyClaimed) {
          setDailyReward({ coins: r.data.coinReward, streak: r.data.newStreak });
        }
      }).catch(() => {});
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connectAsync().then(socket => {
        if (!socket) return;

        socket.on('duel_invited', (data: { challengerId: string; mode: string; duelId: string }) => {
          const catName = CATEGORIES.find(c => c.id === data.mode)?.name ?? data.mode;
          Alert.alert(
            '⚔️ Düello Daveti!',
            `${catName} kategorisinde bir düello daveti aldın. Kabul ediyor musun?`,
            [
              { text: 'Reddet', style: 'cancel', onPress: () => socket.emit('duel_reject', { challengerId: data.challengerId }) },
              { text: 'Kabul Et', onPress: () => socket.emit('duel_accept', { challengerId: data.challengerId }) },
            ]
          );
        });

        socket.on('duel_accepted', (data: { duelId: string; category?: string }) => {
          router.push(`/duel/${data.duelId}?cat=${data.category ?? 'general'}` as any);
        });

        socket.on('live_tournament_soon', (data: { message: string; minutesLeft: number }) => {
          Alert.alert('🏟️ Canlı Yarışma!', data.message, [
            { text: 'Tamam' },
            { text: 'Şimdi Git', onPress: () => router.push('/live' as any) },
          ]);
        });

        socket.on('live_tournament_start', () => {
          Alert.alert('🔴 Yarışma Başladı!', 'Katılmak ister misin?', [
            { text: 'Sonra' },
            { text: 'Katıl!', onPress: () => router.push('/live' as any) },
          ]);
        });
      });
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
      const isVerifyEmail = segments[0] === '(auth)' && segments[1] === 'verify-email';
      if (!isVerifyEmail && (inAuthGroup || inOnboarding)) {
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
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SplashScreenView />
      </GestureHandlerRootView>
    );
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
        <DailyLoginModal
          visible={!!dailyReward}
          coinReward={dailyReward?.coins ?? 0}
          newStreak={dailyReward?.streak ?? 1}
          onClose={() => setDailyReward(null)}
        />
        <Modal visible={showStreakGoalModal} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={s.modalBox}>
              <Text style={s.modalEmoji}>🔥</Text>
              <Text style={s.modalTitle}>Seri Hedefin Nedir?</Text>
              <Text style={s.modalSub}>Kaç günlük seri yapmak istiyorsun? Hedefe ulaşınca seni kutlayacağız!</Text>
              {[7, 14, 30, 60].map(days => (
                <TouchableOpacity
                  key={days}
                  style={s.goalBtn}
                  onPress={async () => {
                    await setStreakGoal(days);
                    await AsyncStorage.setItem('streakGoalAsked', 'true');
                    setShowStreakGoalModal(false);
                  }}
                >
                  <Text style={s.goalBtnTxt}>{days} Gün 🔥</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.setItem('streakGoalAsked', 'true');
                  setShowStreakGoalModal(false);
                }}
              >
                <Text style={s.skipTxt}>Şimdilik geç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
          <Stack.Screen name="duel/lobby"       options={{ animation: 'slide_from_right', animationDuration: 280 }} />
          <Stack.Screen name="duel/matchmaking" options={{ presentation: 'fullScreenModal', animation: 'fade', animationDuration: 300 }} />
          <Stack.Screen name="duel/[duelId]"    options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', animationDuration: 400 }} />

          {/* İçerik ekranları — sağdan kayma */}
          <Stack.Screen name="stats"      options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="challenge"  options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="clan"       options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="battlepass" options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="tasks"      options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="settings"       options={{ headerShown: false, animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="reset-password"   options={{ animation: 'fade', animationDuration: 300 }} />
          <Stack.Screen name="kategoriler"      options={{ animation: 'slide_from_bottom', animationDuration: 300 }} />
          <Stack.Screen name="friend/[userId]"  options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="privacy-policy"   options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="terms-of-service" options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="help"             options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="feedback"         options={{ animation: 'slide_from_right', animationDuration: 260 }} />
          <Stack.Screen name="badges"           options={{ animation: 'slide_from_right', animationDuration: 260 }} />
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
  modalOverlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#13132a', borderRadius: 24, padding: 28, alignItems: 'center' },
  modalEmoji: { fontSize: 48, marginBottom: 8 },
  modalTitle: { color: '#fff', fontSize: 20, fontFamily: 'Nunito-ExtraBold', marginBottom: 8, textAlign: 'center' },
  modalSub: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  goalBtn: { width: '100%', backgroundColor: '#6c3aed', borderRadius: 14, paddingVertical: 14, marginBottom: 10, alignItems: 'center' },
  goalBtnTxt: { color: '#fff', fontSize: 16, fontFamily: 'Nunito-Bold' },
  skipTxt: { color: '#6b7280', fontSize: 13, marginTop: 8 },
});
