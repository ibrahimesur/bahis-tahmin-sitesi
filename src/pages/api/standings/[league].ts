import type { NextApiRequest, NextApiResponse } from 'next';
import { LeagueStandings, TeamStanding } from '../../../types';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ standings: TeamStanding[] } | { error: string }>
) {
  const { league } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API yapılandırması eksik' });
  }

  try {
    const response = await fetch(`${API_URL}/competitions/${league}/standings`, {
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Hatası:', {
        status: response.status,
        message: errorData.message
      });
      throw new Error(errorData.message || 'Puan durumu alınamadı');
    }

    const data: LeagueStandings = await response.json();
    
    // Sadece genel puan durumunu al (home/away hariç)
    const standings = data.standings[0].table;

    res.status(200).json({ standings });
  } catch (error) {
    console.error('API Hatası:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Puan durumu alınamadı' });
  }
} 