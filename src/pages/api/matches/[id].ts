import type { NextApiRequest, NextApiResponse } from 'next';
import { MatchDetail, ApiFootballFixture, ApiFootballEvent, MatchEvent } from '../../../types';

// API-Football bilgileri
const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = 'api-football-v1.p.rapidapi.com';
const API_URL = 'https://api-football-v1.p.rapidapi.com/v3';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MatchDetail | { error: string }>
) {
  const { id } = req.query;
  
  console.log('Maç detayları API isteği alındı:', id);
  console.log('API_KEY:', API_KEY ? 'Mevcut' : 'Eksik');

  if (!id || Array.isArray(id)) {
    console.error('Geçersiz maç ID\'si:', id);
    return res.status(400).json({ error: 'Geçerli bir maç ID\'si gerekli' });
  }

  if (!API_KEY) {
    console.error('API anahtarı bulunamadı');
    return res.status(500).json({ error: 'API yapılandırması eksik' });
  }

  try {
    // Varsayılan istatistik değerleri için yardımcı fonksiyon
    const getDefaultStats = () => ({
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      possession: { home: 50, away: 50 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 }
    });

    // Maç detayları
    console.log(`Maç detayları için API isteği yapılıyor: ${API_URL}/fixtures?id=${id}`);
    
    const matchResponse = await fetch(`${API_URL}/fixtures?id=${id}`, {
      headers: { 
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    }).catch(error => {
      console.error('Maç detayları API hatası:', error);
      return res.status(500).json({ error: 'Maç detayları alınamadı' });
    });

    if (!matchResponse?.ok) {
      console.error('Maç detayları API yanıt hatası:', {
        status: matchResponse?.status,
        statusText: matchResponse?.statusText
      });
      return res.status(500).json({ error: 'Maç detayları alınamadı' });
    }

    const matchData = await matchResponse.json().catch(error => {
      console.error('Maç detayları JSON ayrıştırma hatası:', error);
      return res.status(500).json({ error: 'Maç detayları ayrıştırılamadı' });
    });

    if (!matchData.response || !Array.isArray(matchData.response) || matchData.response.length === 0) {
      console.error('Maç detayları bulunamadı:', matchData);
      return res.status(404).json({ error: 'Maç detayları bulunamadı' });
    }

    const match: ApiFootballFixture = matchData.response[0];

    // İstatistikler
    console.log(`Maç istatistikleri için API isteği yapılıyor: ${API_URL}/fixtures/statistics?fixture=${id}`);
    
    const statsResponse = await fetch(`${API_URL}/fixtures/statistics?fixture=${id}`, {
      headers: { 
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    }).catch(error => {
      console.error('Maç istatistikleri API hatası:', error);
      // İstatistik hatası kritik değil, devam ediyoruz
    });

    let stats = getDefaultStats();
    
    if (statsResponse?.ok) {
      const statsData = await statsResponse.json().catch(error => {
        console.error('Maç istatistikleri JSON ayrıştırma hatası:', error);
        // İstatistik hatası kritik değil, devam ediyoruz
      });

      if (statsData?.response && Array.isArray(statsData.response) && statsData.response.length >= 2) {
        const homeStats = statsData.response[0]?.statistics || [];
        const awayStats = statsData.response[1]?.statistics || [];

        const findStatValue = (statArray: any[], type: string) => {
          const stat = statArray.find(s => s.type === type);
          if (!stat) return null;
          
          // Yüzde işaretini kaldır
          if (typeof stat.value === 'string' && stat.value.includes('%')) {
            return parseInt(stat.value.replace('%', ''));
          }
          
          return stat.value || 0;
        };

        stats = {
          shots: { 
            home: findStatValue(homeStats, 'Total Shots') || 0, 
            away: findStatValue(awayStats, 'Total Shots') || 0 
          },
          shotsOnTarget: { 
            home: findStatValue(homeStats, 'Shots on Goal') || 0, 
            away: findStatValue(awayStats, 'Shots on Goal') || 0 
          },
          possession: { 
            home: findStatValue(homeStats, 'Ball Possession') || 50, 
            away: findStatValue(awayStats, 'Ball Possession') || 50 
          },
          corners: { 
            home: findStatValue(homeStats, 'Corner Kicks') || 0, 
            away: findStatValue(awayStats, 'Corner Kicks') || 0 
          },
          fouls: { 
            home: findStatValue(homeStats, 'Fouls') || 0, 
            away: findStatValue(awayStats, 'Fouls') || 0 
          },
          yellowCards: { 
            home: findStatValue(homeStats, 'Yellow Cards') || 0, 
            away: findStatValue(awayStats, 'Yellow Cards') || 0 
          },
          redCards: { 
            home: findStatValue(homeStats, 'Red Cards') || 0, 
            away: findStatValue(awayStats, 'Red Cards') || 0 
          }
        };
      }
    }

    // Kadrolar
    console.log(`Maç kadroları için API isteği yapılıyor: ${API_URL}/fixtures/lineups?fixture=${id}`);
    
    const lineupsResponse = await fetch(`${API_URL}/fixtures/lineups?fixture=${id}`, {
      headers: { 
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    }).catch(error => {
      console.error('Maç kadroları API hatası:', error);
      // Kadro hatası kritik değil, devam ediyoruz
    });

    let homeLineup = {
      team: {
        id: match.teams.home.id,
        name: match.teams.home.name,
        logo: match.teams.home.logo
      },
      formation: '4-4-2',
      startingXI: [],
      substitutes: [],
      coach: {
        id: 0,
        name: 'Bilinmiyor',
        photo: ''
      }
    };

    let awayLineup = {
      team: {
        id: match.teams.away.id,
        name: match.teams.away.name,
        logo: match.teams.away.logo
      },
      formation: '4-4-2',
      startingXI: [],
      substitutes: [],
      coach: {
        id: 0,
        name: 'Bilinmiyor',
        photo: ''
      }
    };

    if (lineupsResponse?.ok) {
      const lineupsData = await lineupsResponse.json().catch(error => {
        console.error('Maç kadroları JSON ayrıştırma hatası:', error);
        // Kadro hatası kritik değil, devam ediyoruz
      });

      if (lineupsData?.response && Array.isArray(lineupsData.response) && lineupsData.response.length > 0) {
        lineupsData.response.forEach((lineup: any) => {
          const isHome = lineup.team.id === match.teams.home.id;
          const currentLineup = isHome ? homeLineup : awayLineup;
          
          currentLineup.formation = lineup.formation || '4-4-2';
          currentLineup.coach = {
            id: lineup.coach.id || 0,
            name: lineup.coach.name || 'Bilinmiyor',
            photo: lineup.coach.photo || ''
          };
          
          currentLineup.startingXI = (lineup.startXI || []).map((player: any, index: number) => ({
            id: player.player.id || index + 1,
            name: player.player.name || `Oyuncu ${index + 1}`,
            number: player.player.number || index + 1,
            position: player.player.pos || 'Bilinmiyor'
          }));
          
          currentLineup.substitutes = (lineup.substitutes || []).map((player: any, index: number) => ({
            id: player.player.id || index + 100,
            name: player.player.name || `Yedek ${index + 1}`,
            number: player.player.number || index + 20,
            position: player.player.pos || 'Bilinmiyor'
          }));
        });
      }
    }

    // Head to Head
    console.log(`Head to Head için API isteği yapılıyor: ${API_URL}/fixtures/headtohead?h2h=${match.teams.home.id}-${match.teams.away.id}&last=5`);
    
    const h2hResponse = await fetch(`${API_URL}/fixtures/headtohead?h2h=${match.teams.home.id}-${match.teams.away.id}&last=5`, {
      headers: { 
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    }).catch(error => {
      console.error('Head to Head API hatası:', error);
      // H2H hatası kritik değil, devam ediyoruz
    });

    let h2hMatches = [];
    
    if (h2hResponse?.ok) {
      const h2hData = await h2hResponse.json().catch(error => {
        console.error('Head to Head JSON ayrıştırma hatası:', error);
        // H2H hatası kritik değil, devam ediyoruz
      });

      if (h2hData?.response && Array.isArray(h2hData.response)) {
        h2hMatches = h2hData.response
          .filter((h2hMatch: ApiFootballFixture) => h2hMatch.fixture.id && h2hMatch.fixture.id.toString() !== id.toString())
          .slice(0, 5)
          .map((h2hMatch: ApiFootballFixture) => ({
            id: h2hMatch.fixture.id.toString(),
            date: h2hMatch.fixture.date,
            homeTeam: {
              id: h2hMatch.teams.home.id,
              name: h2hMatch.teams.home.name,
              score: h2hMatch.goals.home || 0
            },
            awayTeam: {
              id: h2hMatch.teams.away.id,
              name: h2hMatch.teams.away.name,
              score: h2hMatch.goals.away || 0
            },
            competition: {
              id: h2hMatch.league.id,
              name: h2hMatch.league.name
            }
          }));
      }
    }

    // Olaylar (goller, kartlar, değişiklikler)
    const events = match.events || [];
    const formattedEvents = events.map((event: ApiFootballEvent) => ({
      id: `${event.time.elapsed}-${event.team.id}-${event.player.id || '0'}`,
      type: event.type === 'Goal' ? 'goal' :
            event.type === 'Card' && event.detail === 'Red Card' ? 'red_card' :
            event.type === 'Card' && event.detail === 'Yellow Card' ? 'yellow_card' :
            event.type === 'subst' ? 'substitution' : 'other',
      minute: event.time.elapsed,
      team: event.team.id === match.teams.home.id ? 'home' : 'away',
      playerName: event.player.name
    }));

    // Maç durumu
    const matchStatus = match.fixture.status.short === 'LIVE' || match.fixture.status.short === 'HT' || match.fixture.status.short === '1H' || match.fixture.status.short === '2H' ? 'live' : 
                        match.fixture.status.short === 'FT' || match.fixture.status.short === 'AET' || match.fixture.status.short === 'PEN' ? 'finished' : 'not_started';

    // Sonuç
    const matchDetail: MatchDetail = {
      id: match.fixture.id.toString(),
      homeTeam: {
        name: match.teams.home.name,
        score: match.goals.home || 0,
        redCards: events.filter(e => e.team.id === match.teams.home.id && e.type === 'Card' && e.detail === 'Red Card').length,
        logo: match.teams.home.logo
      },
      awayTeam: {
        name: match.teams.away.name,
        score: match.goals.away || 0,
        redCards: events.filter(e => e.team.id === match.teams.away.id && e.type === 'Card' && e.detail === 'Red Card').length,
        logo: match.teams.away.logo
      },
      minute: match.fixture.status.elapsed || 0,
      league: match.league.name,
      status: matchStatus as 'live' | 'finished' | 'not_started',
      events: formattedEvents as MatchEvent[],
      venue: {
        id: match.fixture.venue?.id || 0,
        name: match.fixture.venue?.name || 'Bilinmiyor',
        city: match.fixture.venue?.city || 'Bilinmiyor'
      },
      referee: {
        id: 0,
        name: match.fixture.referee || 'Bilinmiyor',
        nationality: 'Bilinmiyor'
      },
      stats: stats,
      lineups: {
        home: homeLineup,
        away: awayLineup
      },
      h2h: h2hMatches
    };

    res.status(200).json(matchDetail);
  } catch (error) {
    console.error('API Hatası:', error);
    res.status(500).json({ error: 'Maç detayları alınamadı' });
  }
} 