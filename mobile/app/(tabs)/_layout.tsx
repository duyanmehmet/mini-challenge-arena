import { Tabs } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';
import { Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { theme } = useSettingsStore();
  const C = Colors[theme];
  const insets = useSafeAreaInsets();

  // Android gesture nav + iOS home indicator için dinamik yükseklik
  const tabBarHeight = 56 + (insets.bottom > 0 ? insets.bottom : Platform.OS === 'android' ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bgSecondary,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: C.accentRed,
        tabBarInactiveTintColor: C.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'Nunito-SemiBold', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 24 : 20, color }}>{focused ? '🏠' : '🏠'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Liderlik',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 24 : 20, color }}>🏆</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Arkadaşlar',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 24 : 20, color }}>👥</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Mağaza',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 24 : 20, color }}>🪙</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 24 : 20, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}