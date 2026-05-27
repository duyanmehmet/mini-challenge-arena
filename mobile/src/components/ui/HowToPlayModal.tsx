import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GameMode = 'antrenman' | 'lig' | 'duel' | 'challenge';

interface Rule { icon: string; title: string; desc: string }

const CONTENT: Record<GameMode, { emoji: string; title: string; rules: Rule[] }> = {
  antrenman: {
    emoji: '📚',
    title: 'Antrenman Modu',
    rules: [
      { icon: '🗂️', title: 'Kategori Seç',       desc: 'İstediğin kategoriden 15 soru gelir.' },
      { icon: '⏱️', title: '15 Saniye / Soru',    desc: 'Her sorunun 15 saniyen var. Geç kalırsan yanlış sayılır.' },
      { icon: '✂️', title: 'Joker Kullan',        desc: '50:50, Değiştir ve Pas jokerlerini kullanabilirsin.' },
      { icon: '📵', title: 'İnternetsiz Oynanır', desc: 'Sorular cihazına yüklüdür, bağlantı gerekmez.' },
    ],
  },
  lig: {
    emoji: '🏆',
    title: 'Lig Modu',
    rules: [
      { icon: '❤️', title: '5 Canın Var',          desc: 'Yanlış cevap veya süre bitince 1 can gider. 0 can → oyun biter.' },
      { icon: '⚡', title: 'Hızlı = Fazla Puan',   desc: 'İlk 2 saniyede doğru cevap en yüksek puanı verir.' },
      { icon: '🎡', title: 'Çark & Kategori',       desc: 'Çarkı döndür veya istediğin kategoriyi seç.' },
      { icon: '📊', title: 'Haftalık Sıralama',    desc: 'Puan biriktir, ligi tırman. Haftanın sonunda terfi/düşüş.' },
    ],
  },
  duel: {
    emoji: '⚔️',
    title: 'Düello Modu',
    rules: [
      { icon: '👥', title: 'Arkadaşınla Oyna',    desc: 'Arkadaş listenden birini seç, düello daveti gönder.' },
      { icon: '❓', title: 'Aynı Sorular',         desc: 'İkinize de aynı soru seti gelir, eş zamanlı oynarsınız.' },
      { icon: '🏆', title: 'Kazanan Belirlenir',   desc: 'En fazla doğru cevap yapan kazanır. Beraberde hızlı olan.' },
      { icon: '🪙', title: 'Coin Stake',           desc: 'Masada belirtilen coin miktarını kazanırsın veya kaybedersin.' },
    ],
  },
  challenge: {
    emoji: '🎯',
    title: 'Challenge Modu',
    rules: [
      { icon: '📅', title: 'Günlük Meydan Okuma', desc: 'Her gün yeni bir challenge yayınlanır, herkese açık.' },
      { icon: '⏰', title: 'Süre Sınırlı',         desc: 'Belirlenen süre içinde mümkün olduğunca çok soruyu doğru cevapla.' },
      { icon: '🪙', title: 'Bonus Ödüller',        desc: 'Challengeı tamamlarsan ekstra coin ve XP kazanırsın.' },
      { icon: '🥇', title: 'Sıralama',             desc: 'Skorun o günün liderlik tablosuna girer, en iyiyle yarış.' },
    ],
  },
};

interface Props {
  mode: GameMode;
  visible: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ mode, visible, onClose }: Props) {
  const { emoji, title, rules } = CONTENT[mode];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.emoji}>{emoji}</Text>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>Nasıl Oynanır?</Text>

          <View style={s.rules}>
            {rules.map((r, i) => (
              <View key={i} style={s.ruleRow}>
                <View style={s.ruleIcon}>
                  <Text style={{ fontSize: 22 }}>{r.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.ruleTitle}>{r.title}</Text>
                  <Text style={s.ruleDesc}>{r.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={s.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={s.btnTxt}>Anladım, Oyna! →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Hook: ilk girişte otomatik göster, sonrasında manuel kontrol
export function useHowToPlay(mode: GameMode) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(`howtoplay_${mode}`).then((seen) => {
      if (!seen) setVisible(true);
    });
  }, [mode]);

  const hide = async () => {
    setVisible(false);
    await AsyncStorage.setItem(`howtoplay_${mode}`, '1');
  };

  const show = () => setVisible(true);

  return { visible, show, hide };
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#13132a',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e2b5a',
  },
  emoji:    { fontSize: 52, marginBottom: 8 },
  title:    { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: '#fff', marginBottom: 2, textAlign: 'center' },
  subtitle: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#7c7aaa', marginBottom: 20 },
  rules:    { width: '100%', gap: 14, marginBottom: 24 },
  ruleRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  ruleIcon: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#1e1e3a',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1, borderColor: '#2e2b5a',
  },
  ruleTitle: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff', marginBottom: 2 },
  ruleDesc:  { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#9ca3af', lineHeight: 18 },
  btn: {
    width: '100%', backgroundColor: '#6c3aed',
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6c3aed', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  btnTxt: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: '#fff' },
});
