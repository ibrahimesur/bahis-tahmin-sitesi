import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import Layout from '../../../components/Layout';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { apiRequest } from '../../../utils/api';

export default function EditorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    articles: 0,
    predictions: 0,
    followers: 0,
    successRate: 0
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

    fetchEditorStats();
  }, [user, router]);

  const fetchEditorStats = async () => {
    try {
      setIsLoading(true);
      console.log('Editör istatistikleri için istek yapılıyor...');
      
      // apiRequest fonksiyonunu kullanarak istek yap
      const data = await apiRequest('editor/stats', 'GET');
      console.log('Alınan editör istatistikleri:', data);
      
      setStats(data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      toast.error('İstatistikler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Yayın Yönetimi</h1>
            <div className="flex space-x-4">
              <Link
                href="/editor/dashboard/articles/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Yeni Makale
              </Link>
              <Link
                href="/editor/dashboard/predictions/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Yeni Tahmin
              </Link>
            </div>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Makaleler</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.articles}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/editor/dashboard/articles" className="font-medium text-blue-600 hover:text-blue-500">
                    Tüm Makaleleri Görüntüle
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tahminler</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.predictions}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/editor/dashboard/predictions" className="font-medium text-green-600 hover:text-green-500">
                    Tüm Tahminleri Görüntüle
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Takipçiler</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.followers}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/editor/dashboard/followers" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Takipçileri Görüntüle
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Başarı Oranı</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">%{stats.successRate}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/editor/dashboard/predictions" className="font-medium text-yellow-600 hover:text-yellow-500">
                    Tahmin Performansını Görüntüle
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Son Yayınlar */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Son Yayınlar</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {/* Yayın listesi burada olacak */}
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Henüz yayın bulunmuyor</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Hızlı Erişim */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Hızlı Erişim</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/editor/dashboard/articles/new"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Yeni Makale Oluştur
              </Link>
              <Link
                href="/editor/dashboard/predictions/new"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                Yeni Tahmin Oluştur
              </Link>
              <Link
                href="/editor/dashboard/profile"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
              >
                Editör Profilini Düzenle
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 