import type { NextApiRequest, NextApiResponse } from 'next';
import { TeamStanding, ApiFootballStanding } from '../../../types';

// API-Football bilgileri
const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = 'api-football-v1.p.rapidapi.com';
const API_URL = 'https://api-football-v1.p.rapidapi.com/v3';

// Lig ID'leri eşleştirmesi
const LEAGUE_MAPPING: { [key: string]: number } = {
  'PL': 39,   // Premier League
  'BL1': 78,  // Bundesliga
  'SA': 135,  // Serie A
  'PD': 140,  // La Liga
  'FL1': 61,  // Ligue 1
  'CL': 2,    // UEFA Champions League
  'ELC': 40,  // Championship
  'PPL': 94,  // Primeira Liga
  'DED': 88   // Eredivisie
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ standings: TeamStanding[] } | { error: string }>
) {
  const { league } = req.query;

  console.log(`[${new Date().toISOString()}] Puan durumu API isteği alındı:`, league);
  console.log(`[${new Date().toISOString()}] API_KEY:`, API_KEY ? 'Mevcut' : 'Eksik');

  // CORS başlıklarını ekle
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (!API_KEY) {
    console.error(`[${new Date().toISOString()}] API anahtarı bulunamadı`);
    return res.status(500).json({ error: 'API yapılandırması eksik' });
  }

  if (!league || Array.isArray(league)) {
    console.error(`[${new Date().toISOString()}] Geçersiz lig parametresi:`, league);
    return res.status(400).json({ error: 'Geçerli bir lig kodu belirtilmelidir' });
  }

  // Lig ID'sini kontrol et ve dönüştür
  const leagueId = LEAGUE_MAPPING[league];
  if (!leagueId) {
    console.error(`[${new Date().toISOString()}] Desteklenmeyen lig kodu:`, league);
    return res.status(400).json({ error: 'Desteklenmeyen lig kodu' });
  }

  try {
    // Mevcut sezonu al (API-Football'da sezon yılı olarak belirtilir, örn: 2023)
    const currentYear = new Date().getFullYear();
    const season = currentYear;

    const url = `${API_URL}/standings?league=${leagueId}&season=${season}`;
    console.log(`[${new Date().toISOString()}] API isteği yapılıyor:`, {
      url,
      method: 'GET',
      headers: { 
        'X-RapidAPI-Key': 'API_KEY_MEVCUT',
        'X-RapidAPI-Host': API_HOST
      }
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    });

    console.log(`[${new Date().toISOString()}] API yanıt durumu:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[${new Date().toISOString()}] API hata yanıtı:`, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error(`[${new Date().toISOString()}] Hata yanıtı JSON olarak ayrıştırılamadı:`, e);
        errorData = { message: errorText };
      }
      
      console.error(`[${new Date().toISOString()}] API Hatası:`, {
        status: response.status,
        statusText: response.statusText,
        message: errorData.message || 'Bilinmeyen hata',
        data: errorData
      });
      
      return res.status(response.status).json({ 
        error: `Football API Hatası: ${response.status} - ${errorData.message || response.statusText}` 
      });
    }

    const responseText = await response.text();
    console.log(`[${new Date().toISOString()}] API yanıt metni (ilk 200 karakter):`, responseText.substring(0, 200));
    
    let data: { response: ApiFootballStanding[] };
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] API yanıtı JSON olarak ayrıştırılamadı:`, e);
      return res.status(500).json({ error: 'API yanıtı geçersiz format içeriyor' });
    }

    if (!data.response || !Array.isArray(data.response) || data.response.length === 0) {
      console.error(`[${new Date().toISOString()}] Puan durumu verisi bulunamadı:`, data);
      return res.status(404).json({ error: 'Puan durumu verisi bulunamadı' });
    }

    // API-Football'dan gelen veriyi bizim formatımıza dönüştürüyoruz
    const apiStandings = data.response[0];
    
    if (!apiStandings.league || !apiStandings.league.standings || !Array.isArray(apiStandings.league.standings[0])) {
      console.error(`[${new Date().toISOString()}] Puan durumu verisi geçersiz format içeriyor:`, apiStandings);
      return res.status(500).json({ error: 'Puan durumu verisi geçersiz format içeriyor' });
    }

    const formattedStandings: TeamStanding[] = apiStandings.league.standings[0].map(standing => ({
      position: standing.rank,
      team: {
        id: standing.team.id,
        name: standing.team.name,
        shortName: standing.team.name,
        crest: standing.team.logo
      },
      playedGames: standing.all.played,
      form: standing.form,
      won: standing.all.win,
      draw: standing.all.draw,
      lost: standing.all.lose,
      points: standing.points,
      goalsFor: standing.all.goals.for,
      goalsAgainst: standing.all.goals.against,
      goalDifference: standing.goalsDiff
    }));

    console.log(`[${new Date().toISOString()}] Puan durumu başarıyla alındı, takım sayısı:`, formattedStandings.length);
    
    if (formattedStandings.length > 0) {
      console.log(`[${new Date().toISOString()}] İlk takım:`, formattedStandings[0].team.name);
      console.log(`[${new Date().toISOString()}] Son takım:`, formattedStandings[formattedStandings.length - 1].team.name);
    }

    res.status(200).json({ standings: formattedStandings });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sunucu hatası:`, error);
    res.status(500).json({ error: 'Puan durumu alınamadı' });
  }
} 