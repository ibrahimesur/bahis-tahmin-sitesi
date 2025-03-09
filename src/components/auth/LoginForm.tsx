import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();
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
    setLoading(true);
    setError('');
    setDebugInfo(null);

    try {
      console.log('LoginForm: Giriş denemesi başlatılıyor', { email: formData.email });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      console.log('LoginForm: API yanıtı alındı', { 
        status: response.status, 
        statusText: response.statusText 
      });
      
      // Yanıt içeriğini al
      const responseText = await response.text();
      let data;
      
      try {
        // JSON olarak ayrıştırmayı dene
        data = JSON.parse(responseText);
        console.log('LoginForm: Yanıt verisi', { 
          success: data.success, 
          hasUser: !!data.user, 
          hasToken: !!data.token 
        });
      } catch (parseError) {
        console.error('LoginForm: JSON ayrıştırma hatası', parseError);
        setDebugInfo(`JSON ayrıştırma hatası: ${responseText}`);
        throw new Error('Sunucu yanıtı geçersiz format içeriyor');
      }

      if (!response.ok) {
        console.error('LoginForm: Başarısız yanıt', data);
        setDebugInfo(JSON.stringify(data, null, 2));
        throw new Error(data.message || 'Giriş yapılırken bir hata oluştu');
      }

      // Kullanıcı bilgilerini ve token'ı kontrol et
      if (!data.user || !data.token) {
        console.error('LoginForm: Eksik kullanıcı bilgisi veya token', data);
        setDebugInfo(JSON.stringify(data, null, 2));
        throw new Error('Sunucu yanıtında kullanıcı bilgisi veya token eksik');
      }

      // Kullanıcı bilgilerini ve token'ı kaydet
      const userData = {
        ...data.user,
        token: data.token
      };
      
      console.log('LoginForm: Kullanıcı giriş yapıyor', { 
        id: userData.id, 
        role: userData.role,
        tokenLength: userData.token.length
      });
      
      login(userData);

      // Başarılı giriş mesajı
      toast.success('Giriş başarılı!');
      
      // Kullanıcı rolüne göre yönlendirme
      if (userData.role === 'editor') {
        router.push('/editor/dashboard');
      } else if (userData.role === 'admin') {
        router.push('/admin');
      } else {
        // Normal kullanıcı için ana sayfaya yönlendir
        router.push('/');
      }
    } catch (err) {
      console.error('LoginForm: Giriş hatası', err);
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
      toast.error(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
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