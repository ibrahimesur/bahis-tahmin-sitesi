import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { LiveScore } from '../types';
import MatchCard from '../components/matches/MatchCard';
import { fetchLiveMatches } from '../services/api';

const LEAGUES = [
  { id: 'all', name: 'Tüm Ligler' },
  { id: 'Premier League', name: 'Premier League' },
  { id: 'Primera Division', name: 'La Liga' },
  { id: 'Bundesliga', name: 'Bundesliga' },
  { id: 'Serie A', name: 'Serie A' },
  { id: 'Ligue 1', name: 'Ligue 1' },
  { id: 'UEFA Champions League', name: 'UEFA Champions League' },
  { id: 'Championship', name: 'Championship' },
  { id: 'Primeira Liga', name: 'Primeira Liga' },
  { id: 'Eredivisie', name: 'Eredivisie' }
];

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'finished'>('live');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [matches, setMatches] = useState<LiveScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLiveMatches();
        setMatches(data);
        setError(null);
      } catch (err) {
        setError('Maç verileri yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
    const interval = setInterval(loadMatches, 60000); // Her dakika güncelle

    return () => clearInterval(interval);
  }, []);

  // Liglere göre filtrele
  const filteredMatches = matches.filter(match => 
    selectedLeague === 'all' || match.league === selectedLeague
  );

  // Duruma göre filtrele
  const liveMatches = filteredMatches.filter(match => match.status === 'live');
  const upcomingMatches = filteredMatches.filter(match => match.status === 'not_started');
  const completedMatches = filteredMatches.filter(match => match.status === 'finished');

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Maçlar</h1>
          
          <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'live'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Canlı Maçlar
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Günün Maçları
            </button>
            <button
              onClick={() => setActiveTab('finished')}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'finished'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tamamlanan Maçlar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol Sidebar - Ligler */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Ligler</h2>
              <div className="space-y-2">
                {LEAGUES.map(league => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.id)}
                    className={`w-full text-left px-4 py-2 rounded ${
                      selectedLeague === league.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    {league.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ana İçerik - Maçlar */}
          <div className="lg:col-span-3">
            {error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
                <button 
                  onClick={() => window.location.reload()} 
                  className="ml-2 underline"
                >
                  Yeniden dene
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === 'live' && (
                  liveMatches.length > 0 ? (
                    liveMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Şu anda canlı maç bulunmuyor
                    </div>
                  )
                )}
                
                {activeTab === 'upcoming' && (
                  upcomingMatches.length > 0 ? (
                    upcomingMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Bugün oynanacak maç bulunmuyor
                    </div>
                  )
                )}
                
                {activeTab === 'finished' && (
                  completedMatches.length > 0 ? (
                    completedMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Tamamlanan maç bulunmuyor
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 