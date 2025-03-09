import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import Layout from '../../../components/Layout';
import Link from 'next/link';
import { Article } from '../../../types';
import EditorGuard from '../../../components/editor/EditorGuard';

const EditorDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  const fetchArticles = async () => {
    try {
      setIsArticlesLoading(true);
      // Burada gerçek API çağrısı yapılacak
      // Şimdilik örnek veri kullanıyoruz
      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'Fenerbahçe\'nin Şampiyonlar Ligi Analizi',
          content: 'Fenerbahçe bu sezon...',
          authorId: user?.id || '',
          createdAt: new Date(),
          category: 'analysis'
        },
        {
          id: '2',
          title: 'Galatasaray Transfer Haberleri',
          content: 'Galatasaray\'ın yeni transferi...',
          authorId: user?.id || '',
          createdAt: new Date(),
          category: 'news'
        }
      ];
      
      // Gerçek uygulamada:
      // const response = await fetch('/api/editor/articles', {
      //   headers: {
      //     'Authorization': `Bearer ${user?.token}`
      //   }
      // });
      // const data = await response.json();
      // setArticles(data.articles);
      
      setArticles(mockArticles);
    } catch (error) {
      console.error('Makaleler yüklenirken hata oluştu:', error);
    } finally {
      setIsArticlesLoading(false);
    }
  };

  return (
    <EditorGuard>
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Editör Paneli</h1>
            <Link href="/editor/dashboard/new-article" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Yeni Yazı Ekle
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Hoş Geldiniz, {user?.username}!</h2>
            <p className="text-gray-600">
              Bu panelden yazılarınızı yönetebilir, yeni yazılar ekleyebilir ve mevcut yazılarınızı düzenleyebilirsiniz.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Yazılarım</h2>
            
            {isArticlesLoading ? (
              <p>Yazılar yükleniyor...</p>
            ) : articles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="py-3 px-4 text-left">Başlık</th>
                      <th className="py-3 px-4 text-left">Kategori</th>
                      <th className="py-3 px-4 text-left">Tarih</th>
                      <th className="py-3 px-4 text-left">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">{article.title}</td>
                        <td className="py-3 px-4">
                          {article.category === 'analysis' && 'Analiz'}
                          {article.category === 'news' && 'Haber'}
                          {article.category === 'column' && 'Köşe Yazısı'}
                        </td>
                        <td className="py-3 px-4">{new Date(article.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td className="py-3 px-4">
                          <Link href={`/editor/dashboard/edit/${article.id}`} className="text-blue-600 hover:text-blue-800 mr-3">
                            Düzenle
                          </Link>
                          <button 
                            onClick={() => confirm('Bu yazıyı silmek istediğinize emin misiniz?')} 
                            className="text-red-600 hover:text-red-800"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Henüz yazı eklenmemiş.</p>
            )}
          </div>
        </div>
      </Layout>
    </EditorGuard>
  );
};

export default EditorDashboard; 