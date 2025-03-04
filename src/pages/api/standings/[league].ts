import type { NextApiRequest, NextApiResponse } from 'next';
import { LeagueStandings, TeamStanding } from '../../../types';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ standings: TeamStanding[] } | { error: string }>
) {
  const { league } = req.query;

  console.log('Puan durumu API isteği alındı:', league);
  console.log('API_KEY:', API_KEY ? 'Mevcut' : 'Eksik');

  if (!API_KEY) {
    console.error('API anahtarı bulunamadı');
    return res.status(500).json({ error: 'API yapılandırması eksik' });
  }

  try {
    const url = `${API_URL}/competitions/${league}/standings`;
    console.log('API isteği yapılıyor:', {
      url,
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
      
      console.error('API Hatası:', {
        status: response.status,
        statusText: response.statusText,
        message: errorData.message || 'Bilinmeyen hata',
        data: errorData
      });
      
      return res.status(response.status).json({ 
        error: `Football API Hatası: ${response.status} - ${errorData.message || response.statusText}` 
      });
    }

    const data: LeagueStandings = await response.json();
    console.log('API yanıtı alındı:', {
      competition: data.competition?.name,
      season: data.season,
      standingsCount: data.standings?.length || 0
    });
    
    // Puan durumu kontrolü
    if (!data.standings || !Array.isArray(data.standings) || data.standings.length === 0) {
      console.error('Puan durumu verisi bulunamadı:', data);
      return res.status(404).json({ error: 'Puan durumu verisi bulunamadı' });
    }
    
    // Sadece genel puan durumunu al (home/away hariç)
    const standings = data.standings[0].table;
    
    console.log('İşlenmiş puan durumu:', {
      count: standings.length,
      firstTeam: standings[0]?.team?.name,
      lastTeam: standings[standings.length - 1]?.team?.name
    });

    res.status(200).json({ standings });
  } catch (error) {
    console.error('API Hatası:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Puan durumu alınamadı' });
  }
} 