import { LiveScore } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

export async function fetchLiveMatches(): Promise<LiveScore[]> {
  try {
    const response = await fetch('/api/matches');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API yanıt vermedi');
    }

    const matches = await response.json();
    return matches;
  } catch (error) {
    console.error('Detaylı hata:', error);
    throw error;
  }
}

// Test verileri hata durumu için
const mockMatches: LiveScore[] = [
  {
    id: '1',
    homeTeam: { name: 'Galatasaray', score: 2, redCards: 0 },
    awayTeam: { name: 'Fenerbahçe', score: 1, redCards: 1 },
    minute: 67,
    league: 'Süper Lig',
    status: 'live',
    events: [
      { id: '1', type: 'goal', minute: 23, team: 'home', playerName: 'Icardi' },
      { id: '2', type: 'red_card', minute: 45, team: 'away', playerName: 'Dzeko' },
    ],
  },
  {
    id: '2',
    homeTeam: { name: 'Barcelona', score: 3, redCards: 0 },
    awayTeam: { name: 'Real Madrid', score: 2, redCards: 0 },
    minute: 75,
    league: 'La Liga',
    status: 'live',
    events: [
      { id: '3', type: 'goal', minute: 15, team: 'home', playerName: 'Lewandowski' },
      { id: '4', type: 'goal', minute: 34, team: 'away', playerName: 'Vinicius' },
    ],
  },
];

// Gerçek API bağlantısı için bu fonksiyonu kullanabilirsiniz
/*
export async function fetchLiveMatches() {
  try {
    const response = await fetch('/api/live-scores');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}
*/ 