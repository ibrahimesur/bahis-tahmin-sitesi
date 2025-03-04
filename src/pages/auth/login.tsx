import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log(`[${new Date().toISOString()}] Giriş denemesi başlatılıyor:`, formData.email);
      
      // API isteği gönder
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      console.log(`[${new Date().toISOString()}] API yanıtı alındı, durum kodu:`, response.status);
      console.log(`[${new Date().toISOString()}] Yanıt başlıkları:`, {
        contentType: response.headers.get('Content-Type'),
        contentLength: response.headers.get('Content-Length')
      });
      
      // Yanıtın içeriğini text olarak al
      const responseText = await response.text();
      console.log(`[${new Date().toISOString()}] API yanıt metni:`, 
        responseText.substring(0, 150) + (responseText.length > 150 ? '...' : ''));
      
      // Yanıt boş mu kontrol et
      if (!responseText || responseText.trim() === '') {
        console.error(`[${new Date().toISOString()}] API boş yanıt döndürdü`);
        throw new Error('Sunucu yanıtı boş. Lütfen daha sonra tekrar deneyin.');
      }
      
      // Yanıtın JSON formatında olup olmadığını kontrol et
      let data;
      try {
        data = JSON.parse(responseText);
        console.log(`[${new Date().toISOString()}] JSON yanıtı başarıyla ayrıştırıldı:`, 
          JSON.stringify(data).substring(0, 100));
      } catch (jsonError) {
        console.error(`[${new Date().toISOString()}] API yanıtı JSON formatında değil:`, 
          responseText.substring(0, 150));
        console.error(`[${new Date().toISOString()}] JSON ayrıştırma hatası:`, jsonError);
        throw new Error('Sunucu yanıtı geçersiz format içeriyor. Lütfen daha sonra tekrar deneyin.');
      }

      if (!response.ok) {
        console.error(`[${new Date().toISOString()}] API hatası:`, data.error);
        throw new Error(data.error || 'Giriş başarısız');
      }

      // Kullanıcı verisi kontrolü
      if (!data.user) {
        console.error(`[${new Date().toISOString()}] API yanıtında kullanıcı verisi yok:`, data);
        throw new Error('Kullanıcı bilgileri alınamadı');
      }

      console.log(`[${new Date().toISOString()}] Giriş başarılı, kullanıcı bilgileri alındı`);
      
      // Context'e kullanıcı bilgisini kaydet
      login(data.user);
      
      // Ana sayfaya yönlendir
      router.push('/');
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Giriş hatası:`, err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Hemen Kayıt Olun
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                    Beni Hatırla
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Şifremi Unuttum
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 