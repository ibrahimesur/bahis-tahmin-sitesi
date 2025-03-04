import type { NextApiRequest, NextApiResponse } from 'next';
import { LeagueStandings, TeamStanding } from '../../../types';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

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

  try {
    const url = `${API_URL}/competitions/${league}/standings`;
    console.log(`[${new Date().toISOString()}] API isteği yapılıyor:`, {
      url,
      method: 'GET',
      headers: { 'X-Auth-Token': 'API_KEY_MEVCUT' }
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': API_KEY
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
    
    let data: LeagueStandings;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] API yanıtı JSON olarak ayrıştırılamadı:`, e);
      return res.status(500).json({ error: 'API yanıtı geçersiz format içeriyor' });
    }

    console.log(`[${new Date().toISOString()}] API yanıtı alındı:`, {
      competition: data.competition?.name,
      season: data.season,
      standingsCount: data.standings?.length || 0
    });
    
    // Puan durumu kontrolü
    if (!data.standings || !Array.isArray(data.standings) || data.standings.length === 0) {
      console.error(`[${new Date().toISOString()}] Puan durumu verisi bulunamadı:`, data);
      return res.status(404).json({ error: 'Puan durumu verisi bulunamadı' });
    }
    
    // Sadece genel puan durumunu al (home/away hariç)
    const standings = data.standings[0].table;
    
    if (!standings || !Array.isArray(standings) || standings.length === 0) {
      console.error(`[${new Date().toISOString()}] Puan tablosu verisi bulunamadı:`, data.standings);
      return res.status(404).json({ error: 'Puan tablosu verisi bulunamadı' });
    }
    
    console.log(`[${new Date().toISOString()}] İşlenmiş puan durumu:`, {
      count: standings.length,
      firstTeam: standings[0]?.team?.name,
      lastTeam: standings[standings.length - 1]?.team?.name
    });

    res.status(200).json({ standings });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Hatası:`, error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Puan durumu alınamadı' });
  }
} 