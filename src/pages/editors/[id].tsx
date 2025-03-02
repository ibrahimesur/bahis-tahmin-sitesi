import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Image from 'next/image';

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

  useEffect(() => {
    if (id) fetchEditorDetail();
  }, [id]);

  const fetchEditorDetail = async () => {
    try {
      const response = await fetch(`/api/editors/${id}`);
      if (!response.ok) throw new Error('Editör bilgileri alınamadı');
      const data = await response.json();
      setEditor(data);
    } catch (error) {
      console.error('Editör detayı yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/editors/${id}/follow`, {
        method: editor?.isFollowing ? 'DELETE' : 'POST'
      });
      if (!response.ok) throw new Error('İşlem başarısız');
      setEditor(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
    } catch (error) {
      console.error('Takip işlemi başarısız:', error);
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
            <div className="animate-pulse">
              {/* ... loading state ... */}
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
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      editor.isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {editor.isFollowing ? 'Takibi Bırak' : 'Takip Et'}
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