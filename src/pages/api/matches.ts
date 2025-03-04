import type { NextApiRequest, NextApiResponse } from 'next';
import { LiveScore } from '../../types';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

const AVAILABLE_LEAGUES = {
  'PL': 'Premier League',
  'BL1': 'Bundesliga',
  'SA': 'Serie A',
  'PD': 'La Liga',
  'FL1': 'Ligue 1',
  'CL': 'UEFA Champions League',
  'ELC': 'Championship',
  'PPL': 'Primeira Liga',
  'DED': 'Eredivisie'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LiveScore[] | { error: string }>
) {
  console.log('API isteği alındı');
  console.log('API_KEY:', API_KEY ? 'Mevcut' : 'Eksik');
  
  if (!API_KEY) {
    console.error('API anahtarı bulunamadı');
    return res.status(500).json({ error: 'API yapılandırması eksik' });
  }

  try {
    // Bugünün tarihini al
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Sadece istediğimiz liglerin maçlarını al
    const leagueIds = Object.keys(AVAILABLE_LEAGUES).join(',');
    const url = `${API_URL}/matches?date=${dateStr}&competitions=${leagueIds}`;

    console.log('API isteği yapılıyor:', {
      url,
      date: dateStr,
      headers: { 'X-Auth-Token': 'API_KEY_MEVCUT' }
    });

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.error('Football API Hatası:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      return res.status(response.status).json({ 
        error: `Football API Hatası: ${response.status} - ${errorData.message || response.statusText}` 
      });
    }

    const data = await response.json();
    console.log('API yanıtı:', JSON.stringify(data, null, 2));

    // Her maçın durumunu kontrol edelim
    data.matches.forEach((match: any) => {
      console.log(`${match.homeTeam.name} vs ${match.awayTeam.name}:`, {
        status: match.status,
        utcDate: match.utcDate,
        competition: match.competition.name,
        score: match.score
      });
    });

    if (!data.matches || !Array.isArray(data.matches)) {
      console.error('Geçersiz API yanıtı:', data);
      return res.status(500).json({ error: 'Geçersiz API yanıtı' });
    }
    
    const getMatchStatus = (status: string): LiveScore['status'] => {
      switch (status) {
        case 'IN_PLAY':
        case 'PAUSED':
        case 'FIRST_HALF':
        case 'SECOND_HALF':
          return 'live';
        case 'FINISHED':
          return 'finished';
        case 'SCHEDULED':
        case 'TIMED':
          return 'not_started';
        default:
          console.log('Bilinmeyen maç durumu:', status);
          return 'not_started';
      }
    };

    const matches = data.matches.map((match: any) => {
      // Debug için maç bilgilerini logla
      console.log('Ham maç verisi:', {
        match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        status: match.status,
        minute: match.minute,
        utcDate: match.utcDate,
        lastUpdated: match.lastUpdated
      });

      // Dakika hesaplama fonksiyonu
      const calculateMinute = (match: any) => {
        if (match.status === 'FINISHED') return 90;
        if (match.status === 'HALF_TIME') return 45;
        if (match.status === 'SCHEDULED' || match.status === 'TIMED') return 0;

        // Canlı maçlar için dakika hesaplama
        if (match.status === 'IN_PLAY' || match.status === 'PAUSED') {
          const startTime = new Date(match.utcDate);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
          
          // İlk yarı
          if (diffMinutes <= 45) return diffMinutes;
          // Devre arası
          if (diffMinutes > 45 && diffMinutes < 60) return 45;
          // İkinci yarı
          return Math.min(90, diffMinutes - 15); // 15 dakika devre arası çıkarıldı
        }

        return 0;
      };

      return {
        id: match.id.toString(),
        homeTeam: {
          name: match.homeTeam.name || match.homeTeam.shortName,
          score: match.score.fullTime.home || match.score.halfTime.home || 0,
          redCards: match.score.redCards?.home || 0,
          logo: match.homeTeam.crest
        },
        awayTeam: {
          name: match.awayTeam.name || match.awayTeam.shortName,
          score: match.score.fullTime.away || match.score.halfTime.away || 0,
          redCards: match.score.redCards?.away || 0,
          logo: match.awayTeam.crest
        },
        minute: calculateMinute(match),
        league: match.competition.name,
        status: getMatchStatus(match.status),
        events: []
      };
    });

    const sortedMatches = matches.sort((a: LiveScore, b: LiveScore) => {
      // Önce canlı maçları göster
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;

      // Sonra bugünün maçlarını göster
      if (a.status === 'not_started' && b.status === 'finished') return -1;
      if (a.status === 'finished' && b.status === 'not_started') return 1;

      // Aynı durumdaki maçları dakikalarına göre sırala
      if (a.status === b.status) {
        if (a.status === 'live') {
          return b.minute - a.minute; // Canlı maçları dakikaya göre ters sırala
        }
        if (a.status === 'finished') {
          return b.minute - a.minute; // Bitmiş maçları en son oynanandan başla
        }
      }

      return 0;
    });

    console.log('İşlenmiş maçlar:', sortedMatches.map((m: LiveScore) => ({
      id: m.id,
      teams: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
      status: m.status,
      league: m.league
    }))); // Debug için
    res.status(200).json(sortedMatches);
  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Bilinmeyen hata' });
  }
} 