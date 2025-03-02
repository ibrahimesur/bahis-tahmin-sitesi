import type { NextApiRequest, NextApiResponse } from 'next';
import { LiveScore } from '../../../types';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_URL = 'https://api.football-data.org/v4';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LiveScore[] | { error: string }>
) {
  if (!API_KEY) {
    return res.status(500).json({ error: 'API yapılandırması eksik' });
  }

  try {
    const response = await fetch(`${API_URL}/matches?status=LIVE,IN_PLAY,PAUSED`, {
      headers: { 'X-Auth-Token': API_KEY }
    });

    if (!response.ok) {
      throw new Error('API yanıt vermedi');
    }

    const data = await response.json();

    // API'den gelen veriyi LiveScore formatına dönüştür
    const liveMatches: LiveScore[] = data.matches.map((match: any) => ({
      id: match.id.toString(),
      homeTeam: {
        name: match.homeTeam.name,
        score: match.score.fullTime.home || match.score.halfTime.home || 0,
        redCards: match.score.redCards?.home || 0,
        logo: match.homeTeam.crest
      },
      awayTeam: {
        name: match.awayTeam.name,
        score: match.score.fullTime.away || match.score.halfTime.away || 0,
        redCards: match.score.redCards?.away || 0,
        logo: match.awayTeam.crest
      },
      minute: match.minute || 0,
      league: match.competition.name,
      status: match.status === 'PAUSED' ? 'live' : 'live',
      events: []
    }));

    res.status(200).json(liveMatches);
  } catch (error) {
    console.error('API Hatası:', error);
    res.status(500).json({ error: 'Maç verileri alınamadı' });
  }
} 