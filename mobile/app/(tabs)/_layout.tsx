import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect } from 'react';

const BG     = '#0d0d1a';
const ACTIVE = '#8b5cf6';
const INACT  = '#4a4870';
const BORDER = '#1e1b3a';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        fontFamily: 'Nunito-SemiBold',
        color: focused ? ACTIVE : INACT,
      }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + (insets.bottom > 0 ? insets.bottom : Platform.OS === 'android' ? 8 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: BORDER,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACT,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Ana Sayfa" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" label="Liderlik" focused={focused} />,
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
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Görevler" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profil" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function OynaButton() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <TouchableOpacity
      style={s.centerBtn}
      onPress={() => router.push('/kategoriler' as any)}
      activeOpacity={0.85}
    >
      <Animated.View style={[s.centerInner, { transform: [{ scale: pulse }] }]}>
        <Text style={{ fontSize: 26 }}>🎮</Text>
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
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#1e1b3a',
  },
  centerLabel: {
    fontSize: 10,
    fontFamily: 'Nunito-SemiBold',
    color: ACTIVE,
    marginTop: 2,
  },
});
