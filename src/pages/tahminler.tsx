import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EditorsList from '../components/EditorsList';
import PredictionCard from '../components/PredictionCard';
import Link from 'next/link';

interface Prediction {
  id: string;
  author: string;
  time: string;
  isPremium: boolean;
  match: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    time: string;
  };
  content: string;
  prediction: string;
  odds: number;
  comments: number;
  likes: number;
}

export default function TahminlerPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Normally, we would fetch predictions from the API
    // For now, we'll use mock data
    const mockPredictions: Prediction[] = [
      {
        id: '1',
        author: 'Ahmet Yılmaz',
        time: '2 saat önce',
        isPremium: true,
        match: {
          homeTeam: 'Galatasaray',
          awayTeam: 'Fenerbahçe',
          league: 'Süper Lig',
          time: 'Bugün, 20:00'
        },
        content: 'Derbide ev sahibi takımın üstünlüğü bekleniyor. Son 5 maçta 4 galibiyet alan Galatasaray formda.',
        prediction: 'MS 1',
        odds: 1.75,
        comments: 24,
        likes: 156
      },
      {
        id: '2',
        author: 'Mehmet Demir',
        time: '5 saat önce',
        isPremium: false,
        match: {
          homeTeam: 'Barcelona',
          awayTeam: 'Real Madrid',
          league: 'La Liga',
          time: 'Yarın, 22:00'
        },
        content: 'El Clasico\'da gollü bir maç bekliyorum. İki takım da hücum futbolu oynuyor.',
        prediction: 'KG Var',
        odds: 1.55,
        comments: 18,
        likes: 142
      },
      {
        id: '3',
        author: 'Ayşe Kaya',
        time: '1 gün önce',
        isPremium: true,
        match: {
          homeTeam: 'Manchester City',
          awayTeam: 'Liverpool',
          league: 'Premier Lig',
          time: 'Cumartesi, 18:30'
        },
        content: 'Premier Lig\'in iki güçlü ekibi karşı karşıya geliyor. City son maçlarda Liverpool\'a karşı üstün.',
        prediction: '2.5 Üst',
        odds: 1.65,
        comments: 32,
        likes: 128
      },
      {
        id: '4',
        author: 'Can Yıldız',
        time: '3 saat önce',
        isPremium: false,
        match: {
          homeTeam: 'Bayern Münih',
          awayTeam: 'Dortmund',
          league: 'Bundesliga',
          time: 'Cumartesi, 20:30'
        },
        content: 'Almanya derbisinde Bayern\'in üstünlüğü bekleniyor. Dortmund deplasmanda zorlanıyor.',
        prediction: 'MS 1',
        odds: 1.45,
        comments: 15,
        likes: 98
      },
      {
        id: '5',
        author: 'Zeynep Aydın',
        time: '1 gün önce',
        isPremium: true,
        match: {
          homeTeam: 'PSG',
          awayTeam: 'Marsilya',
          league: 'Ligue 1',
          time: 'Pazar, 21:00'
        },
        content: 'Fransa derbisinde gollü bir maç bekliyorum. İki takım da ofansif futbol oynuyor.',
        prediction: 'KG Var',
        odds: 1.60,
        comments: 22,
        likes: 87
      }
    ];

    // Sort predictions by likes in descending order
    const sortedPredictions = [...mockPredictions].sort((a, b) => b.likes - a.likes);
    
    setPredictions(sortedPredictions);
    setLoading(false);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tahminler</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tahminler Bölümü - Sol taraf */}
          <div className="md:w-2/3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div key={prediction.id} className="bg-white rounded-lg shadow">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-lg">{prediction.author}</span>
                          <span className="text-gray-500 text-sm ml-2">{prediction.time}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                          </span>
                          <span className="font-medium">{prediction.likes}</span>
                        </div>
                      </div>
                      <PredictionCard prediction={prediction} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editörler Bölümü - Sağ taraf */}
          <div className="md:w-1/3 mt-6 md:mt-0">
            <div className="sticky top-20">
              <EditorsList />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 