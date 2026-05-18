import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { socketService } from '../../src/services/socket.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { getRank } from './lobby';

const { width } = Dimensions.get('window');
const BG    = '#0d0d1a';
const PURP  = '#6c3aed';
const PURP2 = '#8b5cf6';
const TEXT  = '#ffffff';
const MUTED = '#7c7aaa';
const GOLD  = '#f59e0b';

function RadarRing({ delay, size }: { delay: number; size: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.8] });
  const op    = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.3, 0] });
  return (
    <Animated.View style={{
      position: 'absolute',
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 2, borderColor: PURP2,
      transform: [{ scale }], opacity: op,
    }} />
  );
}

export default function MatchmakingScreen() {
  const { stake: stakeParam, duelId, oppName, oppAvatar, oppRank } = useLocalSearchParams<{
    stake?: string; duelId?: string; oppName?: string; oppAvatar?: string; oppRank?: string;
  }>();
  const stake = parseInt(stakeParam ?? '50', 10);
  const { user } = useUserStore();

  const [phase,       setPhase]       = useState<'searching' | 'found' | 'vs'>(duelId ? 'found' : 'searching');
  const [opponent,    setOpponent]    = useState<{ username: string; avatarId: number; duelRank: number } | null>(
    duelId && oppName ? { username: oppName, avatarId: parseInt(oppAvatar ?? '1'), duelRank: parseInt(oppRank ?? '0') } : null
  );
  const [foundDuelId, setFoundDuelId] = useState<string | null>(duelId ?? null);
  const [dots,    setDots]    = useState('.');
  const [elapsed, setElapsed] = useState(0);
  const [status,  setStatus]  = useState('Bağlanıyor...');

  const slideMe   = useRef(new Animated.Value(-width)).current;
  const slideOpp  = useRef(new Animated.Value(width)).current;
  const vsScale   = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length < 3 ? d + '.' : '.'), 500);
    const et = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { clearInterval(iv); clearInterval(et); };
  }, []);

  useEffect(() => {
    if (phase !== 'searching') return;
    let cancelled = false;

    const init = async () => {
      setStatus('🔄 Sunucuya bağlanıyor...');
      const socket = await socketService.connectAsync();
      if (cancelled) return;

      if (!socket?.connected) {
        setStatus('❌ Bağlantı kurulamadı');
        Alert.alert('Bağlantı Sorunu', 'Sunucuya bağlanılamadı.');
        router.back();
        return;
      }

      setStatus('✅ Bağlandı — rakip aranıyor...');

      socket.on('mm_matched', (data: { duelId: string; stake: number; opponent: any }) => {
        socket.off('mm_matched');
        socket.off('mm_waiting');
        setOpponent(data.opponent);
        setFoundDuelId(data.duelId);
        setPhase('found');
        setTimeout(() => setPhase('vs'), 800);
      });

      socket.on('mm_waiting', () => {
        setStatus('📡 Kuyruğa eklendi — rakip aranıyor...');
      });

      socket.emit('mm_join', { stake });
      setStatus(`📤 Aranıyor... (${stake} 🪙 masa)`);

      const timeout = setTimeout(() => {
        socket.off('mm_matched');
        socket.off('mm_waiting');
        socket.emit('mm_cancel');
        Alert.alert('Rakip Bulunamadı', 'Şu an müsait rakip yok. Arkadaşını davet et!', [
          { text: 'Geri Dön', onPress: () => router.back() },
        ]);
      }, 30000);

      return () => {
        clearTimeout(timeout);
        socket.off('mm_matched');
        socket.off('mm_waiting');
      };
    };

    const cleanup = init();
    return () => {
      cancelled = true;
      cleanup.then(fn => fn?.());
    };
  }, []);

  useEffect(() => {
    if (phase === 'found') setTimeout(() => setPhase('vs'), 600);
    if (phase === 'vs') {
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(slideMe,  { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
          Animated.spring(slideOpp, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]),
        Animated.spring(vsScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 5,   duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5,  duration: 60, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setTimeout(() => {
          const finalDuelId = foundDuelId ?? duelId ?? `mm-${Date.now()}`;
          router.replace(`/duel/${finalDuelId}?stake=${stake}` as any);
        }, 2000);
      });
    }
  }, [phase]);

  const handleCancel = () => {
    socketService.getSocket()?.emit('mm_cancel');
    socketService.getSocket()?.off('mm_matched');
    socketService.getSocket()?.off('mm_waiting');
    router.back();
  };

  const myRank      = getRank((user as any)?.duelRank ?? 0);
  const oppRankInfo = opponent ? getRank(opponent.duelRank) : null;

  if (phase === 'vs' && opponent) {
    return (
      <Animated.View style={[vs.root, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={vs.bg} />
        <Animated.View style={[vs.side, { transform: [{ translateX: slideMe }] }]}>
          <Avatar avatarId={user?.avatarId ?? 1} size={90} />
          <View style={[vs.rankBadge, { borderColor: myRank.color }]}>
            <Text style={{ fontSize: 14 }}>{myRank.icon}</Text>
            <Text style={[vs.rankTxt, { color: myRank.color }]}>{myRank.label}</Text>
          </View>
          <Text style={vs.playerName}>{user?.username}</Text>
        </Animated.View>

        <Animated.Text style={[vs.vsText, { transform: [{ scale: vsScale }] }]}>VS</Animated.Text>

        <Animated.View style={[vs.side, { transform: [{ translateX: slideOpp }] }]}>
          <Avatar avatarId={opponent.avatarId} size={90} />
          {oppRankInfo && (
            <View style={[vs.rankBadge, { borderColor: oppRankInfo.color }]}>
              <Text style={{ fontSize: 14 }}>{oppRankInfo.icon}</Text>
              <Text style={[vs.rankTxt, { color: oppRankInfo.color }]}>{oppRankInfo.label}</Text>
            </View>
          )}
          <Text style={vs.playerName}>{opponent.username}</Text>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <TouchableOpacity onPress={handleCancel} style={s.cancelBtn}>
        <Text style={s.cancelTxt}>İptal</Text>
      </TouchableOpacity>

      <View style={s.center}>
        <View style={s.radar}>
          <RadarRing delay={0}    size={200} />
          <RadarRing delay={600}  size={200} />
          <RadarRing delay={1200} size={200} />
          <View style={s.radarCore}>
            <Avatar avatarId={user?.avatarId ?? 1} size={70} />
          </View>
        </View>

        <Text style={s.searchTxt}>Rakip aranıyor{dots}</Text>
        <Text style={s.elapsed}>⚡ {elapsed}sn geçti</Text>
        <Text style={[s.elapsed, { color: '#a78bfa', fontSize: 11, marginTop: 4 }]}>{status}</Text>

        <View style={s.stakeBadge}>
          <Text style={s.stakeTxt}>🪙 {stake.toLocaleString('tr-TR')} Masa</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: BG },
  cancelBtn:  { padding: 16, alignSelf: 'flex-end' },
  cancelTxt:  { fontFamily: 'Nunito-Regular', fontSize: 15, color: MUTED },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  radar:      { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  radarCore:  { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1a1040', alignItems: 'center', justifyContent: 'center',
                shadowColor: PURP2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  searchTxt:  { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: TEXT },
  elapsed:    { fontFamily: 'Nunito-Regular', fontSize: 13, color: MUTED },
  stakeBadge: { backgroundColor: GOLD + '22', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, borderWidth: 1, borderColor: GOLD + '66' },
  stakeTxt:   { fontFamily: 'Nunito-Bold', fontSize: 14, color: GOLD },
});

const vs = StyleSheet.create({
  root:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 24 },
  bg:        { ...StyleSheet.absoluteFillObject, backgroundColor: '#08001a' },
  side:      { alignItems: 'center', gap: 10, flex: 1 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#1a1040' },
  rankTxt:   { fontFamily: 'Nunito-ExtraBold', fontSize: 12 },
  playerName:{ fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: TEXT, textAlign: 'center' },
  vsText:    { fontFamily: 'Nunito-ExtraBold', fontSize: 52, color: PURP2,
               textShadowColor: PURP, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24 },
});
