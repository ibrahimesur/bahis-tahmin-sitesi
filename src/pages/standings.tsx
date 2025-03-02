import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface TeamStanding {
  position: number;
  team: {
    name: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface LeagueStandings {
  competition: {
    name: string;
    code: string;
    emblem: string;
  };
  standings: TeamStanding[];
}

export default function StandingsPage() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const leagues = [
    { code: 'PL', name: 'Premier League' },
    { code: 'PD', name: 'La Liga' },
    { code: 'SA', name: 'Serie A' },
    { code: 'BL1', name: 'Bundesliga' },
    { code: 'FL1', name: 'Ligue 1' }
  ];

  useEffect(() => {
    const fetchStandings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/standings/${selectedLeague}`);
        if (!response.ok) throw new Error('Puan durumu alınamadı');
        
        const data = await response.json();
        setStandings(data.standings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandings();
  }, [selectedLeague]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Puan Durumu</h1>

        {/* Lig Seçimi */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {leagues.map(league => (
            <button
              key={league.code}
              onClick={() => setSelectedLeague(league.code)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedLeague === league.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>

        {/* Puan Durumu Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-center">Yükleniyor...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Takım
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    O
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    G
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    B
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    M
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AV
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.map((team) => (
                  <tr key={team.team.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={team.team.crest}
                          alt={team.team.name}
                          className="h-6 w-6 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {team.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {team.playedGames}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {team.won}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {team.draw}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {team.lost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {team.goalDifference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
} 