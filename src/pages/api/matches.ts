import type { NextApiRequest, NextApiResponse } from 'next';
import { LiveScore, ApiFootballFixture } from '../../types';

// API-Football bilgileri
const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = 'api-football-v1.p.rapidapi.com';
const API_URL = 'https://api-football-v1.p.rapidapi.com/v3';

// Desteklenen ligler ve ID'leri
const AVAILABLE_LEAGUES = {
  '39': 'Premier League',
  '78': 'Bundesliga',
  '135': 'Serie A',
  '140': 'La Liga',
  '61': 'Ligue 1',
  '2': 'UEFA Champions League',
  '40': 'Championship',
  '94': 'Primeira Liga',
  '88': 'Eredivisie'
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
    // Tarih aralığı oluştur (son 7 gün ve gelecek 7 gün)
    const today = new Date();
    
    // 7 gün öncesi
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 7);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    
    // 7 gün sonrası
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    // Bugünün tarihi
    const todayStr = today.toISOString().split('T')[0];

    // Sadece istediğimiz liglerin maçlarını al
    const leagueIds = Object.keys(AVAILABLE_LEAGUES).join('-');
    
    // Tarih aralığı için API isteği yap
    const url = `${API_URL}/fixtures?league=${leagueIds}&from=${pastDateStr}&to=${futureDateStr}`;

    console.log('API isteği yapılıyor:', {
      url,
      dateRange: `${pastDateStr} - ${futureDateStr}`,
      today: todayStr,
      headers: { 
        'X-RapidAPI-Key': 'API_KEY_MEVCUT',
        'X-RapidAPI-Host': API_HOST
      }
    });

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
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
    console.log('API yanıtı alındı, maç sayısı:', data.response?.length || 0);
    
    if (!data.response || !Array.isArray(data.response)) {
      console.error('API yanıtı geçersiz format içeriyor:', data);
      return res.status(500).json({ error: 'API yanıtı geçersiz format içeriyor' });
    }

    // API-Football'dan gelen veriyi bizim formatımıza dönüştürüyoruz
    const formattedMatches: LiveScore[] = data.response.map((match: ApiFootballFixture) => ({
      id: match.fixture.id.toString(),
      homeTeam: {
        name: match.teams.home.name,
        score: match.goals.home || 0,
        redCards: match.events?.filter(e => 
          e.team.id === match.teams.home.id && e.type === 'Card' && e.detail === 'Red Card'
        ).length || 0,
        logo: match.teams.home.logo
      },
      awayTeam: {
        name: match.teams.away.name,
        score: match.goals.away || 0,
        redCards: match.events?.filter(e => 
          e.team.id === match.teams.away.id && e.type === 'Card' && e.detail === 'Red Card'
        ).length || 0,
        logo: match.teams.away.logo
      },
      minute: match.fixture.status.elapsed || 0,
      league: match.league.name,
      status: match.fixture.status.short === 'LIVE' || match.fixture.status.short === 'HT' || match.fixture.status.short === '1H' || match.fixture.status.short === '2H' ? 'live' : 
              match.fixture.status.short === 'FT' || match.fixture.status.short === 'AET' || match.fixture.status.short === 'PEN' ? 'finished' : 'not_started',
      events: match.events?.map(event => ({
        id: `${event.time.elapsed}-${event.team.id}-${event.player.id || '0'}`,
        type: event.type === 'Goal' ? 'goal' :
              event.type === 'Card' && event.detail === 'Red Card' ? 'red_card' :
              event.type === 'Card' && event.detail === 'Yellow Card' ? 'yellow_card' :
              event.type === 'subst' ? 'substitution' : 'other',
        minute: event.time.elapsed,
        team: event.team.id === match.teams.home.id ? 'home' : 'away',
        playerName: event.player.name
      })) || []
    }));

    res.status(200).json(formattedMatches);
  } catch (error) {
    console.error('API Hatası:', error);
    res.status(500).json({ error: 'Maç verileri alınamadı' });
  }
} 