import { NextPage } from 'next';
import Head from 'next/head';
import LoginForm from '../components/auth/LoginForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { checkAuth } from '../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if (checkAuth()) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      console.log('Giriş denemesi:', { email });
      
      // API isteği
      const response = await fetch('/api/auth-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Giriş yanıtı alındı:', { 
        status: response.status, 
        statusText: response.statusText 
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Giriş hatası:', errorData);
        throw new Error(errorData.message || 'Giriş yapılırken bir hata oluştu');
      }

      const data = await response.json();
      console.log('JSON yanıtı başarıyla ayrıştırıldı:', JSON.stringify(data).substring(0, 100) + '...');
      console.log('Giriş başarılı, kullanıcı bilgileri alındı');
      
      // Token kontrolü yap
      if (!data.token) {
        console.error('API yanıtında token bulunamadı:', JSON.stringify(data));
        toast.error('Giriş yapılamadı: Sunucudan token alınamadı');
        throw new Error('API yanıtında token bulunamadı');
      }
      
      console.log('Token alındı:', { tokenLength: data.token.length });
      
      // Token bilgisini kullanıcı nesnesine ekle
      const userData = {
        ...data.user,
        token: data.token // API'dan gelen token bilgisini kullanıcı nesnesine ekle
      };
      
      console.log('Kullanıcı nesnesi güncellendi:', { 
        userId: userData.id, 
        role: userData.role,
        hasToken: !!userData.token,
        tokenLength: userData.token ? userData.token.length : 0
      });
      
      // LocalStorage'a ham veriyi kaydet
      try {
        localStorage.setItem('rawLoginResponse', JSON.stringify(data));
        console.log('Ham giriş yanıtı localStorage\'a kaydedildi');
      } catch (storageError) {
        console.error('localStorage\'a ham veri kaydedilirken hata:', storageError);
      }
      
      // Kullanıcı bilgilerini AuthContext'e kaydet
      login(userData);
      
      // Başarılı giriş mesajı
      toast.success('Giriş başarılı!');
      
      // Yönlendirme
      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'editor') {
        router.push('/editor');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Giriş işlemi hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Giriş Yap | Bahis Tahmin Sitesi</title>
        <meta name="description" content="Bahis tahmin sitesine giriş yapın ve tahminlerinizi paylaşın." />
      </Head>

      <div className="container mx-auto px-4 py-12">
        <LoginForm />
      </div>
    </>
  );
};

export default LoginPage; 