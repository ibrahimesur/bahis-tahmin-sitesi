import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../../utils/api';

interface Editor {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  successRate: number;
  followers: number;
  contentCount: number;
}

export default function EditorDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchEditor(id);
      if (user) {
        checkFollowStatus(id);
      }
    }
  }, [id, user]);

  const fetchEditor = async (editorId: string) => {
    try {
      setIsLoading(true);
      console.log('Editör bilgileri için istek yapılıyor:', `/api/editors/${editorId}`);
      
      // Göreceli URL kullanarak istek yap
      const response = await fetch(`/api/editors/${editorId}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error('API yanıtı başarısız:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Editör bilgileri yüklenemedi');
      }
      
      const data = await response.json();
      console.log('Alınan editör verisi:', data);
      setEditor(data);
    } catch (error) {
      console.error('Editör bilgileri yüklenirken hata:', error);
      toast.error('Editör bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowStatus = async (editorId: string) => {
    if (!user || !user.token) return;
    
    try {
      console.log('Takip durumu kontrolü için istek yapılıyor');
      
      // Göreceli URL kullanarak istek yap
      const response = await fetch(`/api/editors/is-following?editorId=${editorId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error('Takip durumu API yanıtı başarısız:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Takip durumu kontrol edilemedi');
      }
      
      const data = await response.json();
      console.log('Takip durumu yanıtı:', data);
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Takip durumu kontrol edilirken hata:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Takip etmek için giriş yapmalısınız');
      router.push('/giris');
      return;
    }
    
    if (!editor) return;
    
    try {
      setIsProcessing(true);
      
      const method = isFollowing ? 'DELETE' : 'POST';
      console.log(`${isFollowing ? 'Takipten çıkma' : 'Takip etme'} isteği gönderiliyor`);
      
      // apiRequest fonksiyonunu kullanarak istek yap
      const response = await apiRequest('editors/follow', method, { editorId: editor.id });
      console.log('Takip işlemi yanıtı:', response);
      
      if (response.isFollowing !== undefined) {
        setIsFollowing(response.isFollowing);
        
        // Başarı mesajı göster
        toast.success(response.message || (isFollowing ? 'Takipten çıkıldı' : 'Takip edildi'));
        
        // Takipçi sayısını güncelle
        setEditor(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            followers: prev.followers + (isFollowing ? -1 : 1)
          };
        });
      }
    } catch (error) {
      console.error('Takip işlemi sırasında hata:', error);
      toast.error(error instanceof Error ? error.message : 'Takip işlemi sırasında bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-8">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!editor) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Editör Bulunamadı</h1>
              <p className="text-gray-600 mb-6">Aradığınız editör bulunamadı veya artık mevcut değil.</p>
              <button
                onClick={() => router.push('/editors')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Tüm Editörlere Dön
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Editör adı ve diğer bilgilerin güvenli bir şekilde kullanılması
  const editorName = editor.name || '';
  const editorBio = editor.bio || 'Profesyonel bahis tahmincisi';
  const editorImage = editor.image || '';
  const editorFirstLetter = editorName.length > 0 ? editorName.charAt(0).toUpperCase() : '';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Editör Başlık Bölümü */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                <div className="relative w-32 h-32 flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  {editorImage ? (
                    <Image
                      src={editorImage}
                      alt={editorName}
                      fill
                      className="rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white">
                      <span className="text-4xl text-gray-500">
                        {editorFirstLetter}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{editorName}</h1>
                  <p className="text-blue-100 mb-4">{editorBio}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                    <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 text-white">
                      <div className="text-xl font-bold">%{editor.successRate}</div>
                      <div className="text-xs">Başarı Oranı</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 text-white">
                      <div className="text-xl font-bold">{editor.contentCount}</div>
                      <div className="text-xs">İçerik</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 text-white">
                      <div className="text-xl font-bold">{editor.followers}</div>
                      <div className="text-xs">Takipçi</div>
                    </div>
                  </div>
                  
                  {/* Takip Et Butonu */}
                  {user && user.id !== editor.id && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={isProcessing}
                      className={`mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm ${
                        isFollowing
                          ? 'text-blue-700 bg-white hover:bg-blue-50'
                          : 'text-white bg-blue-700 hover:bg-blue-800'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          İşleniyor...
                        </span>
                      ) : isFollowing ? (
                        'Takibi Bırak'
                      ) : (
                        'Takip Et'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Editör İçerik Bölümü */}
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Son Tahminler</h2>
              
              {/* Burada editörün tahminleri listelenecek */}
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600">Henüz tahmin bulunmamaktadır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 