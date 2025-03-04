import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { FaFutbol, FaUsers, FaChartLine, FaTicketAlt } from 'react-icons/fa';

// Maç tipi tanımı
interface Match {
  id: number;
  homeTeam: {
    name: string;
    crest: string;
  };
  awayTeam: {
    name: string;
    crest: string;
  };
  utcDate: string;
  status: string;
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  competition: {
    name: string;
    emblem: string;
  };
}

// Editör tipi tanımı
interface Editor {
  id: number;
  name: string;
  image: string;
  successRate: number;
  followers: number;
}

// Tahmin tipi tanımı
interface Prediction {
  id: number;
  match: Match;
  prediction: string;
  odds: number;
  editor: {
    name: string;
    image: string;
  };
}

// Kupon tipi tanımı
interface Coupon {
  id: number;
  matches: {
    match: Match;
    prediction: string;
    odds: number;
  }[];
  totalOdds: number;
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Maçları getir
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        setMatches(data.slice(0, 5)); // İlk 5 maçı al
      } catch (error) {
        console.error('Maçlar yüklenirken hata oluştu:', error);
      }
    };

    // Örnek veriler (gerçek uygulamada API'den gelecek)
    const loadSampleData = () => {
      // Örnek editörler
      setEditors([
        { id: 1, name: 'Ahmet Yılmaz', image: '/images/editors/editor1.jpg', successRate: 78, followers: 1250 },
        { id: 2, name: 'Mehmet Demir', image: '/images/editors/editor2.jpg', successRate: 82, followers: 980 },
        { id: 3, name: 'Ayşe Kaya', image: '/images/editors/editor3.jpg', successRate: 75, followers: 1540 },
        { id: 4, name: 'Fatma Şahin', image: '/images/editors/editor4.jpg', successRate: 80, followers: 1120 },
      ]);

      // Örnek tahminler (gerçek uygulamada API'den gelecek)
      setPredictions([
        { 
          id: 1, 
          match: {
            id: 101,
            homeTeam: { name: 'Galatasaray', crest: 'https://crests.football-data.org/132.png' },
            awayTeam: { name: 'Fenerbahçe', crest: 'https://crests.football-data.org/133.png' },
            utcDate: '2025-03-05T19:00:00Z',
            status: 'SCHEDULED',
            score: { fullTime: { home: null, away: null } },
            competition: { name: 'Süper Lig', emblem: 'https://crests.football-data.org/TUR.png' }
          },
          prediction: 'Ev Sahibi Kazanır',
          odds: 1.85,
          editor: { name: 'Ahmet Yılmaz', image: '/images/editors/editor1.jpg' }
        },
        { 
          id: 2, 
          match: {
            id: 102,
            homeTeam: { name: 'Barcelona', crest: 'https://crests.football-data.org/81.png' },
            awayTeam: { name: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' },
            utcDate: '2025-03-06T20:00:00Z',
            status: 'SCHEDULED',
            score: { fullTime: { home: null, away: null } },
            competition: { name: 'La Liga', emblem: 'https://crests.football-data.org/PD.png' }
          },
          prediction: '2.5 Üst',
          odds: 1.65,
          editor: { name: 'Mehmet Demir', image: '/images/editors/editor2.jpg' }
        },
        { 
          id: 3, 
          match: {
            id: 103,
            homeTeam: { name: 'Manchester City', crest: 'https://crests.football-data.org/65.png' },
            awayTeam: { name: 'Liverpool', crest: 'https://crests.football-data.org/64.png' },
            utcDate: '2025-03-05T17:30:00Z',
            status: 'SCHEDULED',
            score: { fullTime: { home: null, away: null } },
            competition: { name: 'Premier League', emblem: 'https://crests.football-data.org/PL.png' }
          },
          prediction: 'Karşılıklı Gol',
          odds: 1.75,
          editor: { name: 'Ayşe Kaya', image: '/images/editors/editor3.jpg' }
        },
      ]);

      // Örnek günün kuponu
      setCoupon({
        id: 1,
        matches: [
          {
            match: {
              id: 101,
              homeTeam: { name: 'Galatasaray', crest: 'https://crests.football-data.org/132.png' },
              awayTeam: { name: 'Fenerbahçe', crest: 'https://crests.football-data.org/133.png' },
              utcDate: '2025-03-05T19:00:00Z',
              status: 'SCHEDULED',
              score: { fullTime: { home: null, away: null } },
              competition: { name: 'Süper Lig', emblem: 'https://crests.football-data.org/TUR.png' }
            },
            prediction: 'Ev Sahibi Kazanır',
            odds: 1.85
          },
          {
            match: {
              id: 102,
              homeTeam: { name: 'Barcelona', crest: 'https://crests.football-data.org/81.png' },
              awayTeam: { name: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' },
              utcDate: '2025-03-06T20:00:00Z',
              status: 'SCHEDULED',
              score: { fullTime: { home: null, away: null } },
              competition: { name: 'La Liga', emblem: 'https://crests.football-data.org/PD.png' }
            },
            prediction: '2.5 Üst',
            odds: 1.65
          },
          {
            match: {
              id: 103,
              homeTeam: { name: 'Manchester City', crest: 'https://crests.football-data.org/65.png' },
              awayTeam: { name: 'Liverpool', crest: 'https://crests.football-data.org/64.png' },
              utcDate: '2025-03-05T17:30:00Z',
              status: 'SCHEDULED',
              score: { fullTime: { home: null, away: null } },
              competition: { name: 'Premier League', emblem: 'https://crests.football-data.org/PL.png' }
            },
            prediction: 'Karşılıklı Gol',
            odds: 1.75
          }
        ],
        totalOdds: 5.36
      });

      setLoading(false);
    };

    fetchMatches();
    loadSampleData(); // Örnek verileri yükle
  }, []);

  // Tarih formatını düzenleyen yardımcı fonksiyon
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Ana Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Günün Önemli Maçları */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-lg shadow-md p-4 flex flex-col h-[600px] transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:z-10">
              <div className="flex items-center space-x-2 mb-4">
                <FaFutbol className="text-blue-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Günün Önemli Maçları</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Yükleniyor...</p>
                </div>
              ) : (
                <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                  {matches.map((match) => (
                    <Link href={`/matches/${match.id}`} key={match.id}>
                      <div className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{formatDate(match.utcDate)}</span>
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {match.competition.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 relative">
                              <img 
                                src={match.homeTeam.crest} 
                                alt={match.homeTeam.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="font-medium">{match.homeTeam.name}</span>
                          </div>
                          
                          <div className="flex items-center px-3">
                            {match.status === 'FINISHED' ? (
                              <span className="font-bold">
                                {match.score.fullTime.home} - {match.score.fullTime.away}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">vs</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{match.awayTeam.name}</span>
                            <div className="w-6 h-6 relative">
                              <img 
                                src={match.awayTeam.crest} 
                                alt={match.awayTeam.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Link href="/matches">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Tüm Maçları Gör →
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Editörlerin Profilleri */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-4 flex flex-col h-[600px] transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:z-10">
              <div className="flex items-center space-x-2 mb-4">
                <FaUsers className="text-green-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Editörlerimiz</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Yükleniyor...</p>
                </div>
              ) : (
                <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                  {editors.map((editor) => (
                    <Link href={`/editors/${editor.id}`} key={editor.id}>
                      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          <img 
                            src={editor.image} 
                            alt={editor.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{editor.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>Başarı: %{editor.successRate}</span>
                            <span>•</span>
                            <span>{editor.followers} takipçi</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Link href="/editors">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Tüm Editörleri Gör →
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tahmin Bölümü */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2 bg-white rounded-lg shadow-md p-4 flex flex-col h-[600px] transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:z-10">
              <div className="flex items-center space-x-2 mb-4">
                <FaChartLine className="text-purple-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Günün Tahminleri</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Yükleniyor...</p>
                </div>
              ) : (
                <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                  {predictions.map((prediction) => (
                    <div key={prediction.id} className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">{formatDate(prediction.match.utcDate)}</span>
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {prediction.match.competition.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 relative">
                            <img 
                              src={prediction.match.homeTeam.crest} 
                              alt={prediction.match.homeTeam.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="font-medium">{prediction.match.homeTeam.name}</span>
                        </div>
                        
                        <div className="flex items-center px-3">
                          <span className="text-sm text-gray-500">vs</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{prediction.match.awayTeam.name}</span>
                          <div className="w-6 h-6 relative">
                            <img 
                              src={prediction.match.awayTeam.crest} 
                              alt={prediction.match.awayTeam.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img 
                              src={prediction.editor.image} 
                              alt={prediction.editor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/32';
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{prediction.editor.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            {prediction.prediction}
                          </span>
                          <span className="font-bold text-orange-600">
                            {prediction.odds.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center mt-4">
                    <Link href="/predictions">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Tüm Tahminleri Gör →
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Günün Kuponu */}
            <div className="col-span-1 bg-white rounded-lg shadow-md p-4 flex flex-col h-[600px] transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:z-10">
              <div className="flex items-center space-x-2 mb-4">
                <FaTicketAlt className="text-orange-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Günün Kuponu</h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Yükleniyor...</p>
                </div>
              ) : coupon ? (
                <div className="flex flex-col h-full">
                  <div className="space-y-3 mb-4 flex-grow overflow-y-auto pr-2">
                    {coupon.matches.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{formatDate(item.match.utcDate)}</span>
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {item.match.competition.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">{item.match.homeTeam.name}</span>
                          <span className="text-xs text-gray-500">vs</span>
                          <span className="text-sm">{item.match.awayTeam.name}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            {item.prediction}
                          </span>
                          <span className="font-bold text-orange-600">
                            {item.odds.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Toplam Oran:</span>
                      <span className="font-bold text-lg text-orange-600">
                        {coupon.totalOdds.toFixed(2)}
                      </span>
                    </div>
                    
                    <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition">
                      Kuponu Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p>Günün kuponu henüz hazırlanmadı.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 