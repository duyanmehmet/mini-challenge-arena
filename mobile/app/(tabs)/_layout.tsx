import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

const BG     = '#0d0d1a';
const ACTIVE = '#8b5cf6';
const INACT  = '#3d3a6b';
const BORDER = '#1e1b3a';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pb = insets.bottom > 0 ? insets.bottom : Platform.OS === 'android' ? 8 : 0;
  const tabBarHeight = 56 + pb;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: BORDER,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: pb,
          paddingTop: 6,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACT,
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: 'Nunito-SemiBold',
          marginTop: -2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarLabel: 'Sıralama',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'podium' : 'podium-outline'} size={20} color={color} />
          ),
        }}
      />

      {/* Merkez Oyna Butonu */}
      <Tabs.Screen
        name="store"
        options={{
          tabBarButton: () => <OynaButton />,
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          tabBarLabel: 'Arkadaşlar',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function OynaButton() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.1, duration: 950, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,   duration: 950, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <TouchableOpacity
      style={s.centerBtn}
      onPress={() => router.push('/lig' as any)}
      activeOpacity={0.85}
    >
      <Animated.View style={[s.centerInner, { transform: [{ scale: pulse }] }]}>
        <Ionicons name="game-controller" size={26} color="#fff" />
      </Animated.View>
      <Text style={s.centerLabel}>Oyna</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  centerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    gap: 2,
  },
  centerInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#1e1b3a',
  },
  centerLabel: {
    fontSize: 9,
    fontFamily: 'Nunito-SemiBold',
    color: ACTIVE,
  },
});
