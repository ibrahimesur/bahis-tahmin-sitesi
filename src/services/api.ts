import { LiveScore } from '../types';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

export async function fetchLiveMatches(): Promise<LiveScore[]> {
  try {
    const response = await fetch('/api/matches');

    if (!response.ok) {
      console.error('API yanıt hatası:', response.status, response.statusText);
      return []; // Boş dizi döndür
    }

    const matches = await response.json();
    return matches;
  } catch (error) {
    console.error('Detaylı hata:', error);
    return []; // Hata durumunda boş dizi döndür
  }
}

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