import { useState } from 'react';
import { login } from '../../utils/api';
import Link from 'next/link';
import { useRouter } from 'next/router';

const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo(null);
    setLoading(true);

    try {
      console.log('Giriş denemesi:', { email: formData.email });
      const result = await login(formData);
      console.log('Giriş başarılı:', result);
      
      // Başarılı giriş sonrası ana sayfaya yönlendir
      router.push('/');
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      
      // Daha detaylı hata bilgisi
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Ek hata bilgilerini debug kısmında göster
        setDebugInfo(JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          apiBaseUrl: typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'http://localhost:8888/.netlify/functions'
            : '/.netlify/functions'
        }, null, 2));
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h2>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            E-posta Adresi
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
          <Link href="/sifremi-unuttum" className="text-blue-600 hover:underline mb-2 sm:mb-0">
            Şifremi Unuttum
          </Link>
          <Link href="/kayit" className="text-blue-600 hover:underline">
            Hesap Oluştur
          </Link>
        </div>
        
        {debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-64">
            <h3 className="font-bold mb-2">Hata Detayları (Geliştirici İçin):</h3>
            <pre>{debugInfo}</pre>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm; 