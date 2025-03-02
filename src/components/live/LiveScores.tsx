import { useState, useEffect } from 'react';
import { LiveScore } from '../../types';
import LiveScoreCard from './LiveScoreCard';
import { fetchLiveMatches } from '../../services/api';

export default function LiveScores() {
  const [activeLeague, setActiveLeague] = useState<string>('all');
  const [liveMatches, setLiveMatches] = useState<LiveScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchMinutes, setMatchMinutes] = useState<{[key: string]: number}>({});

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      const matches = await fetchLiveMatches();
      setLiveMatches(matches);
      
      const minutes: {[key: string]: number} = {};
      matches.forEach(match => {
        minutes[match.id] = match.minute;
      });
      setMatchMinutes(minutes);
      
      setError(null);
    } catch (err) {
      setError('Maç verileri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    const interval = setInterval(() => {
      setMatchMinutes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          updated[id] = updated[id] + 1;
        });
        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const filteredMatches = activeLeague === 'all' 
    ? liveMatches 
    : liveMatches.filter(match => match.league.toLowerCase().replace(/\s+/g, '-') === activeLeague);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-center text-red-600 py-8">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Canlı Skorlar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => loadMatches()}
            className="p-2 text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveLeague('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeLeague === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setActiveLeague('süper-lig')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeLeague === 'süper-lig'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Süper Lig
            </button>
            <button
              onClick={() => setActiveLeague('la-liga')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeLeague === 'la-liga'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              La Liga
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <LiveScoreCard 
              key={match.id} 
              match={{
                ...match,
                minute: matchMinutes[match.id] || match.minute
              }} 
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Bu ligde şu anda canlı maç bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
} 