import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Link from 'next/link';
import Image from 'next/image';

interface Editor {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  successRate: number;
  followers: number;
}

export default function EditorsPage() {
  const { user } = useAuth();
  const [editors, setEditors] = useState<Editor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEditors();
  }, []);

  const fetchEditors = async () => {
    try {
      const response = await fetch('/api/editors');
      if (!response.ok) throw new Error('Editörler yüklenemedi');
      const data = await response.json();
      console.log('Alınan editör verileri:', data);
      
      // API'den gelen veri yapısını kontrol et
      if (data.editors && Array.isArray(data.editors)) {
        setEditors(data.editors);
      } else {
        console.error('Beklenmeyen veri yapısı:', data);
        setEditors([]);
      }
    } catch (error) {
      console.error('Editörler yüklenirken hata:', error);
      setEditors([]);
    } finally {
      setIsLoading(false);
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
              Editörlerin köşe yazılarını okumak için üye olun veya giriş yapın.
            </p>
            <div className="space-x-4">
              <Link
                href="/giris"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Kayıt Ol
              </Link>
            </div>
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
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="space-y-3 mt-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Editörlerimiz</h1>
          
          {editors.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">Henüz editör bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editors.map((editor) => (
                <Link key={editor.id} href={`/editors/${editor.id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          {editor.image ? (
                            <Image
                              src={editor.image}
                              alt={editor.name}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-2xl text-gray-500">
                                {editor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{editor.name}</h2>
                          <p className="text-sm text-gray-500 mt-1">{editor.bio || 'Editör'}</p>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">%{editor.successRate}</div>
                          <div className="text-xs text-gray-500">Başarı</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{editor.followers}</div>
                          <div className="text-xs text-gray-500">Takipçi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 