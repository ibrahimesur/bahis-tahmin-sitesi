import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { LiveScore } from '../types';
import MatchCard from '../components/matches/MatchCard';
import { fetchLiveMatches } from '../services/api';

// Ligleri ülkelere göre organize et
const COUNTRIES = [
  { 
    id: 'england',
    name: 'İngiltere', 
    leagues: [
      { id: 'Premier League', name: 'Premier League' },
      { id: 'Championship', name: 'Championship' }
    ]
  },
  { 
    id: 'spain',
    name: 'İspanya', 
    leagues: [
      { id: 'La Liga', name: 'La Liga' }
    ]
  },
  { 
    id: 'germany',
    name: 'Almanya', 
    leagues: [
      { id: 'Bundesliga', name: 'Bundesliga' }
    ]
  },
  { 
    id: 'italy',
    name: 'İtalya', 
    leagues: [
      { id: 'Serie A', name: 'Serie A' }
    ]
  },
  { 
    id: 'france',
    name: 'Fransa', 
    leagues: [
      { id: 'Ligue 1', name: 'Ligue 1' }
    ]
  },
  { 
    id: 'netherlands',
    name: 'Hollanda', 
    leagues: [
      { id: 'Eredivisie', name: 'Eredivisie' }
    ]
  },
  { 
    id: 'portugal',
    name: 'Portekiz', 
    leagues: [
      { id: 'Primeira Liga', name: 'Primeira Liga' }
    ]
  },
  { 
    id: 'europe',
    name: 'Avrupa', 
    leagues: [
      { id: 'UEFA Champions League', name: 'UEFA Champions League' }
    ]
  }
];

// Eski LEAGUES sabitinden alınan tüm ligler listesi (filtreleme için)
const ALL_LEAGUES = [
  { id: 'all', name: 'Tüm Ligler' },
  ...COUNTRIES.flatMap(country => country.leagues)
];

// Tarih formatlama fonksiyonu
const formatMatchDate = (dateString?: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Bugün, yarın veya dün ise özel metin göster
  if (date.toDateString() === today.toDateString()) {
    return `Bugün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Yarın ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Dün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Diğer günler için tarih ve saat göster
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'finished'>('live');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [matches, setMatches] = useState<LiveScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  
  // Ülke genişletme durumunu değiştiren fonksiyon
  const toggleCountry = (countryId: string) => {
    setExpandedCountries(prev => ({
      ...prev,
      [countryId]: !prev[countryId]
    }));
  };
  
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

  // Maçları tarihe göre grupla
  const groupMatchesByDate = (matches: LiveScore[]) => {
    const groups: { [key: string]: LiveScore[] } = {};
    
    matches.forEach(match => {
      if (!match.date) return;
      
      const date = new Date(match.date);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(match);
    });
    
    // Tarihleri sırala (yaklaşan maçlar için artan, tamamlanan maçlar için azalan)
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (activeTab === 'finished') {
        return new Date(b).getTime() - new Date(a).getTime(); // Tamamlanan maçlar için en son oynananlar önce
      }
      return new Date(a).getTime() - new Date(b).getTime(); // Yaklaşan maçlar için en yakın tarih önce
    });
    
    return sortedKeys.map(key => ({
      date: key,
      matches: groups[key]
    }));
  };
  
  const groupedUpcomingMatches = groupMatchesByDate(upcomingMatches);
  const groupedCompletedMatches = groupMatchesByDate(completedMatches);

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
                {/* Tüm Ligler seçeneği */}
                <button
                  onClick={() => setSelectedLeague('all')}
                  className={`w-full text-left px-4 py-2 rounded ${
                    selectedLeague === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  Tüm Ligler
                </button>
                
                {/* Ülkelere göre gruplandırılmış ligler */}
                {COUNTRIES.map(country => (
                  <div key={country.id} className="border-t pt-2">
                    <button
                      onClick={() => toggleCountry(country.id)}
                      className="w-full flex items-center justify-between px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <span>{country.name}</span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${expandedCountries[country.id] ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedCountries[country.id] && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                        {country.leagues.map(league => (
                          <button
                            key={league.id}
                            onClick={() => setSelectedLeague(league.id)}
                            className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                              selectedLeague === league.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                            }`}
                          >
                            {league.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
              <div className="space-y-6">
                {activeTab === 'live' && (
                  liveMatches.length > 0 ? (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
                        <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                        Canlı Maçlar
                      </h2>
                      <div className="space-y-4">
                        {liveMatches.map(match => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Şu anda canlı maç bulunmuyor
                    </div>
                  )
                )}

                {activeTab === 'upcoming' && (
                  upcomingMatches.length > 0 ? (
                    <div className="space-y-8">
                      {groupedUpcomingMatches.map(group => (
                        <div key={group.date}>
                          <h2 className="text-xl font-semibold mb-4 text-blue-600">
                            {formatMatchDate(new Date(group.date).toISOString())}
                          </h2>
                          <div className="space-y-4">
                            {group.matches.map(match => (
                              <MatchCard key={match.id} match={match} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Yaklaşan maç bulunmuyor
                    </div>
                  )
                )}

                {activeTab === 'finished' && (
                  completedMatches.length > 0 ? (
                    <div className="space-y-8">
                      {groupedCompletedMatches.map(group => (
                        <div key={group.date}>
                          <h2 className="text-xl font-semibold mb-4 text-gray-600">
                            {formatMatchDate(new Date(group.date).toISOString())}
                          </h2>
                          <div className="space-y-4">
                            {group.matches.map(match => (
                              <MatchCard key={match.id} match={match} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
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

export async function getStaticProps() {
  try {
    // Statik derleme sırasında kullanılacak örnek veri
    return {
      props: {
        matches: [],
        error: null
      }
    };
  } catch (error) {
    console.error('Maç verileri alınırken hata oluştu:', error);
    return {
      props: {
        matches: [],
        error: 'Maç verileri alınamadı'
      }
    };
  }
} 