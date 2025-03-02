import { useState, useEffect } from 'react';
import { LiveScore } from '../../types';
import LiveMatchCard from './LiveMatchCard';

export default function LiveMatchesList() {
  const [matches, setMatches] = useState<LiveScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveMatches();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchLiveMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const response = await fetch('/api/matches/live');
      if (!response.ok) throw new Error('Maç verileri alınamadı');
      const data = await response.json();
      setMatches(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow h-24"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Şu anda canlı maç bulunmuyor
      </div>
    );
  }

  // Maçları lige göre grupla
  const matchesByLeague = matches.reduce((acc, match) => {
    if (!acc[match.league]) {
      acc[match.league] = [];
    }
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, LiveScore[]>);

  return (
    <div className="space-y-6">
      {Object.entries(matchesByLeague).map(([league, leagueMatches]) => (
        <div key={league}>
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-6 h-6 bg-gray-200 rounded-full"></span>
            <h3 className="text-lg font-medium text-gray-900">{league}</h3>
          </div>
          <div className="space-y-2">
            {leagueMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 