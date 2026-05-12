export type LeagueId = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';

export interface League {
  id: LeagueId;
  name: string;
  icon: string;
  color: string;
  weeklyReward: number;
}

export const LEAGUES: League[] = [
  { id: 'bronze',  name: 'Bronz',   icon: '🥉', color: '#cd7f32', weeklyReward: 100  },
  { id: 'silver',  name: 'Gümüş',   icon: '🥈', color: '#c0c0c0', weeklyReward: 250  },
  { id: 'gold',    name: 'Altın',   icon: '🥇', color: '#f0c040', weeklyReward: 500  },
  { id: 'diamond', name: 'Elmas',   icon: '💎', color: '#4ecdc4', weeklyReward: 750  },
  { id: 'legend',  name: 'Efsane',  icon: '👑', color: '#e94560', weeklyReward: 1000 },
];
