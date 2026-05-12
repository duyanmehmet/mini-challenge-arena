import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LeagueBadgeProps {
  league: string;
  size?: 'small' | 'medium' | 'large';
}

export const LeagueBadge: React.FC<LeagueBadgeProps> = ({ league, size = 'medium' }) => {
  const getLeagueConfig = () => {
    switch (league.toLowerCase()) {
      case 'legend':
        return { color: '#FFD700', icon: 'trophy', label: 'Efsane' };
      case 'diamond':
        return { color: '#B9F2FF', icon: 'diamond', label: 'Elmas' };
      case 'gold':
        return { color: '#FFD700', icon: 'medal', label: 'Altın' };
      case 'silver':
        return { color: '#C0C0C0', icon: 'medal', label: 'Gümüş' };
      default:
        return { color: '#CD7F32', icon: 'medal', label: 'Bronz' };
    }
  };

  const config = getLeagueConfig();
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  const fontSize = size === 'small' ? 10 : size === 'medium' ? 14 : 18;

  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <Ionicons name={config.icon as any} size={iconSize} color={config.color} />
      <Text style={[styles.text, { color: config.color, fontSize }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    gap: 5,
  },
  text: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
