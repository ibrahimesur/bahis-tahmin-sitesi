import type { NextApiRequest, NextApiResponse } from 'next';
import { LiveScore } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.FOOTBALL_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error('API yanıt vermedi');
    }

    const data = await response.json();
    
    // API'den gelen veriyi bizim formatımıza dönüştürüyoruz
    const formattedMatches: LiveScore[] = data.response.map((match: any) => ({
      id: match.fixture.id.toString(),
      homeTeam: {
        name: match.teams.home.name,
        score: match.goals.home || 0,
        redCards: match.events?.filter((e: any) => 
          e.team.id === match.teams.home.id && e.type === 'Card' && e.detail === 'Red Card'
        ).length || 0
      },
      awayTeam: {
        name: match.teams.away.name,
        score: match.goals.away || 0,
        redCards: match.events?.filter((e: any) => 
          e.team.id === match.teams.away.id && e.type === 'Card' && e.detail === 'Red Card'
        ).length || 0
      },
      minute: match.fixture.status.elapsed,
      league: match.league.name,
      status: 'live',
      events: match.events?.map((event: any) => ({
        id: event.time.elapsed.toString() + event.team.id,
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
    console.error('Error fetching live matches:', error);
    res.status(500).json({ error: 'Failed to fetch live scores' });
  }
} 