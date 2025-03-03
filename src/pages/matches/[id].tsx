import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Layout from '../../components/Layout';
import { MatchDetail } from '../../types';

export default function MatchDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'lineups' | 'h2h'>('stats');

  useEffect(() => {
    if (id) {
      fetchMatchDetails();
    }
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      const response = await fetch(`/api/matches/${id}`);
      if (!response.ok) throw new Error('Maç detayları alınamadı');
      const data = await response.json();
      setMatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="container mx-auto px-4 py-8 text-center">
        Yükleniyor...
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        {error}
      </div>
    </Layout>
  );

  if (!match) return null;

  // Stat bar component
  const StatBar = ({ label, home, away }: { label: string; home: number; away: number }) => {
    const total = home + away;
    const homePercent = total > 0 ? (home / total) * 100 : 50;
    const awayPercent = total > 0 ? (away / total) * 100 : 50;

    // Topla oynama için özel hesaplama
    if (label === "Topla Oynama") {
      return (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>%{home}</span>
            <span>{label}</span>
            <span>%{away}</span>
          </div>
          <div className="flex h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="bg-blue-500"
              style={{ width: `${home}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${away}%` }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{home}</span>
          <span>{label}</span>
          <span>{away}</span>
        </div>
        <div className="flex h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="bg-blue-500"
            style={{ width: `${homePercent}%` }}
          />
          <div
            className="bg-red-500"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Maç Özeti */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto mb-2 relative">
                <Image
                  src={match.homeTeam.logo || '/team-logos/default.png'}
                  alt={match.homeTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-bold">{match.homeTeam.name}</h2>
            </div>
            
            <div className="text-center px-4">
              <div className="text-3xl font-bold mb-2">
                {match.homeTeam.score} - {match.awayTeam.score}
              </div>
              <span className={`font-semibold ${
                match.status === 'live' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {match.status === 'live' ? `${match.minute}'` :
                 match.status === 'finished' ? 'Tamamlandı' : 'Başlamadı'}
              </span>
            </div>
            
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto mb-2 relative">
                <Image
                  src={match.awayTeam.logo || '/team-logos/default.png'}
                  alt={match.awayTeam.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-bold">{match.awayTeam.name}</h2>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-600">{match.league}</p>
            {match.venue && (
              <p className="text-gray-600">{match.venue.name}, {match.venue.city}</p>
            )}
          </div>
        </div>

        {/* Tab Menü */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'stats'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              İstatistikler
            </button>
            <button
              onClick={() => setActiveTab('lineups')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'lineups'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Kadrolar
            </button>
            <button
              onClick={() => setActiveTab('h2h')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'h2h'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              H2H
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'stats' && match.stats && (
              <div>
                <StatBar 
                  label="Topla Oynama" 
                  home={match.stats.possession.home} 
                  away={match.stats.possession.away} 
                />
                <StatBar 
                  label="Şut" 
                  home={match.stats.shots.home} 
                  away={match.stats.shots.away} 
                />
                <StatBar 
                  label="İsabetli Şut" 
                  home={match.stats.shotsOnTarget.home} 
                  away={match.stats.shotsOnTarget.away} 
                />
                <StatBar 
                  label="Korner" 
                  home={match.stats.corners.home} 
                  away={match.stats.corners.away} 
                />
                <StatBar 
                  label="Faul" 
                  home={match.stats.fouls.home} 
                  away={match.stats.fouls.away} 
                />
              </div>
            )}

            {activeTab === 'lineups' && match.lineups && (
              <div className="grid grid-cols-2 gap-8">
                {/* Ev Sahibi Kadro */}
                <div>
                  <h3 className="font-semibold mb-4">{match.homeTeam.name}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{match.lineups.home.formation}</p>
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-gray-700 mb-2">İlk 11</p>
                      {match.lineups.home.startingXI.map(player => (
                        <div key={player.id} className="flex items-center">
                          <span className="w-8 text-gray-500">{player.number}</span>
                          <span>{player.name}</span>
                          <span className="ml-2 text-xs text-gray-500">{player.position}</span>
                        </div>
                      ))}
                    </div>
                    {match.lineups.home.substitutes.length > 0 && (
                      <div className="space-y-1 mt-4">
                        <p className="font-medium text-sm text-gray-700 mb-2">Yedekler</p>
                        {match.lineups.home.substitutes.map(player => (
                          <div key={player.id} className="flex items-center">
                            <span className="w-8 text-gray-500">{player.number}</span>
                            <span>{player.name}</span>
                            <span className="ml-2 text-xs text-gray-500">{player.position}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <p className="font-medium text-sm text-gray-700">Teknik Direktör</p>
                      <p className="text-sm">{match.lineups.home.coach.name}</p>
                    </div>
                  </div>
                </div>

                {/* Deplasman Kadro */}
                <div>
                  <h3 className="font-semibold mb-4">{match.awayTeam.name}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{match.lineups.away.formation}</p>
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-gray-700 mb-2">İlk 11</p>
                      {match.lineups.away.startingXI.map(player => (
                        <div key={player.id} className="flex items-center">
                          <span className="w-8 text-gray-500">{player.number}</span>
                          <span>{player.name}</span>
                          <span className="ml-2 text-xs text-gray-500">{player.position}</span>
                        </div>
                      ))}
                    </div>
                    {match.lineups.away.substitutes.length > 0 && (
                      <div className="space-y-1 mt-4">
                        <p className="font-medium text-sm text-gray-700 mb-2">Yedekler</p>
                        {match.lineups.away.substitutes.map(player => (
                          <div key={player.id} className="flex items-center">
                            <span className="w-8 text-gray-500">{player.number}</span>
                            <span>{player.name}</span>
                            <span className="ml-2 text-xs text-gray-500">{player.position}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <p className="font-medium text-sm text-gray-700">Teknik Direktör</p>
                      <p className="text-sm">{match.lineups.away.coach.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'h2h' && match.h2h && (
              <div className="space-y-4">
                {match.h2h.map(h2hMatch => (
                  <div key={h2hMatch.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{h2hMatch.homeTeam.name}</span>
                      <span className="text-gray-600">
                        {h2hMatch.homeTeam.score} - {h2hMatch.awayTeam.score}
                      </span>
                      <span className="font-medium">{h2hMatch.awayTeam.name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(h2hMatch.date).toLocaleDateString('tr-TR')} • {h2hMatch.competition.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 