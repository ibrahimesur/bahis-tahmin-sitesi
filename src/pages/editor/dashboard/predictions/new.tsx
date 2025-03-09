import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../contexts/AuthContext';
import Layout from '../../../../components/Layout';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { apiRequest } from '../../../../utils/api';

export default function NewPredictionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    matchId: '',
    prediction: '',
    odds: 1.5
  });

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa veya editör değilse yönlendir
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'editor' && user.role !== 'admin') {
      toast.error('Bu sayfaya erişim yetkiniz yok');
      router.push('/');
      return;
    }

    // Mevcut maçları getir
    fetchMatches();
  }, [user, router]);

  const fetchMatches = async () => {
    try {
      setIsLoadingMatches(true);
      console.log('Maçlar için istek yapılıyor...');
      
      // apiRequest fonksiyonunu kullanarak istek yap
      const data = await apiRequest('matches?status=upcoming', 'GET');
      console.log('Alınan maçlar:', data);
      
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Maçlar yüklenirken hata:', error);
      toast.error('Maçlar yüklenemedi');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'odds' ? parseFloat(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.matchId || !formData.prediction) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Tahmin oluşturma isteği gönderiliyor:', formData);
      
      // apiRequest fonksiyonunu kullanarak istek yap
      const data = await apiRequest('predictions', 'POST', formData);
      console.log('Tahmin oluşturma yanıtı:', data);
      
      toast.success('Tahmin başarıyla oluşturuldu');
      router.push(`/editor/dashboard/predictions/${data.id}`);
    } catch (error) {
      console.error('Tahmin oluşturulurken hata:', error);
      toast.error(error instanceof Error ? error.message : 'Tahmin oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Yeni Tahmin Oluştur</h3>
                <Link
                  href="/editor/dashboard"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Geri Dön
                </Link>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Tahmin oluşturmak için aşağıdaki formu doldurun.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Başlık
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tahmin başlığını girin"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="matchId" className="block text-sm font-medium text-gray-700">
                  Maç
                </label>
                <select
                  id="matchId"
                  name="matchId"
                  value={formData.matchId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  disabled={isLoadingMatches}
                >
                  <option value="">Maç Seçin</option>
                  {matches.map((match: any) => (
                    <option key={match.id} value={match.id}>
                      {match.homeTeam} vs {match.awayTeam} - {new Date(match.date).toLocaleDateString('tr-TR')}
                    </option>
                  ))}
                </select>
                {isLoadingMatches && (
                  <p className="mt-1 text-xs text-gray-500">
                    Maçlar yükleniyor...
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="prediction" className="block text-sm font-medium text-gray-700">
                    Tahmin
                  </label>
                  <select
                    id="prediction"
                    name="prediction"
                    value={formData.prediction}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Tahmin Seçin</option>
                    <option value="HOME_WIN">Ev Sahibi Kazanır</option>
                    <option value="AWAY_WIN">Deplasman Kazanır</option>
                    <option value="DRAW">Beraberlik</option>
                    <option value="BTTS_YES">Karşılıklı Gol Var</option>
                    <option value="BTTS_NO">Karşılıklı Gol Yok</option>
                    <option value="OVER_2_5">2.5 Üst</option>
                    <option value="UNDER_2_5">2.5 Alt</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="odds" className="block text-sm font-medium text-gray-700">
                    Oran
                  </label>
                  <input
                    type="number"
                    name="odds"
                    id="odds"
                    value={formData.odds}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    step="0.01"
                    min="1.01"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Analiz ve Açıklama
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tahmin analizinizi ve açıklamanızı buraya yazın..."
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <Link
                  href="/editor/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yayınlanıyor...
                    </>
                  ) : (
                    'Tahmini Yayınla'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 