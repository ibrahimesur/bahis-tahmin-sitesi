import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../../utils/api';

interface Article {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: string;
  createdAt: string;
  likes: number;
}

interface EditorDetail {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  successRate: number;
  articles: Article[];
  followers: number;
  isFollowing: boolean;
}

export default function EditorDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [editor, setEditor] = useState<EditorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEditor();
      if (user) {
        checkFollowStatus();
      }
    }
  }, [id, user]);

  const fetchEditor = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/editors/${id}`);
      if (!response.ok) throw new Error('Editör bilgileri yüklenemedi');
      const data = await response.json();
      setEditor(data);
    } catch (error) {
      console.error('Editör bilgileri yüklenirken hata:', error);
      toast.error('Editör bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !user.token) return;
    
    try {
      const response = await fetch(`/api/editors/is-following?editorId=${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error('Takip durumu kontrol edilemedi');
      
      const data = await response.json();
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
      const response = await apiRequest('editors/follow', method, { editorId: editor.id });
      
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

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bu Sayfayı Görüntülemek İçin Giriş Yapın
            </h2>
            <p className="text-gray-600 mb-6">
              Editörün yazılarını okumak için üye olun veya giriş yapın.
            </p>
            {/* ... giriş/kayıt butonları ... */}
          </div>
        </div>
      </Layout>
    );
  }

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

  if (!editor) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Editör Profili */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24">
                {editor.avatar ? (
                  <Image
                    src={editor.avatar}
                    alt={editor.username}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-gray-500">
                      {editor.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{editor.username}</h1>
                <p className="text-gray-600 mt-2">{editor.bio || 'Editör'}</p>
                <div className="flex items-center space-x-6 mt-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">%{editor.successRate}</div>
                    <div className="text-sm text-gray-500">Başarı</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{editor.articles.length}</div>
                    <div className="text-sm text-gray-500">Yazı</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{editor.followers}</div>
                    <div className="text-sm text-gray-500">Takipçi</div>
                  </div>
                  <button
                    onClick={handleFollowToggle}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
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
                </div>
              </div>
            </div>
          </div>

          {/* Yazılar */}
          <div className="space-y-6">
            {editor.articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {article.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-blue-600">{article.category}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h2>
                  <p className="text-gray-600 line-clamp-3">{article.content}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-500 hover:text-gray-700">
                        <span>👍 {article.likes}</span>
                      </button>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      Devamını Oku
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
} 