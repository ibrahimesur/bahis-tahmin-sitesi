// API istekleri için yardımcı fonksiyonlar
import { toast } from 'react-hot-toast';
import Router from 'next/router';

// API temel URL'si
const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin + '/api/' 
  : 'http://localhost:3000/api/';

// Kullanıcıyı giriş sayfasına yönlendir
export const redirectToLogin = (message: string = 'Oturum süresi doldu, lütfen tekrar giriş yapın') => {
  if (typeof window !== 'undefined') {
    toast.error(message);
    
    // Geliştirme ortamında yönlendirme yapma
    if (process.env.NODE_ENV === 'development') {
      console.warn('Geliştirme ortamında login sayfasına yönlendirme engellendi');
      return;
    }
    
    // Üretim ortamında yönlendirme yap
    Router.push('/giris');
  }
};

// Local storage'dan token'ı al
export const getToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    console.log('getToken: localStorage kontrol ediliyor');
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      console.log('getToken: localStorage\'da user bulunamadı');
      return null;
    }
    
    console.log('getToken: localStorage\'da user bulundu');
    
    try {
      const user = JSON.parse(userStr);
      console.log('getToken: Kullanıcı bilgileri:', { 
        hasToken: !!user?.token, 
        userKeys: user ? Object.keys(user) : [] 
      });
      
      if (!user || !user.token) {
        console.log('getToken: Token bulunamadı veya geçersiz', { user });
        
        // Geliştirme ortamında token yoksa bile localStorage'ı temizleme
        if (process.env.NODE_ENV !== 'development') {
          localStorage.removeItem('user');
        }
        
        return null;
      }
      
      console.log('getToken: Token bulundu', { tokenLength: user.token.length });
      return user.token;
    } catch (parseError) {
      console.error('getToken: JSON ayrıştırma hatası', parseError);
      console.log('getToken: Ham kullanıcı verisi:', userStr);
      
      // Geçersiz JSON ise localStorage'ı temizle
      localStorage.removeItem('user');
      return null;
    }
  } catch (error) {
    console.error('getToken: Token alınırken hata oluştu', error);
    return null;
  }
};

// API isteği gönder
export const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  includeToken: boolean = true
): Promise<any> => {
  try {
    console.log(`API isteği: ${method} ${endpoint}`, { 
      method, 
      endpoint,
      dataKeys: data ? Object.keys(data) : [],
      includeToken
    });
    
    // URL'yi oluştur
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${API_BASE_URL}${endpoint}`;
    
    console.log('API isteği URL:', url);
    
    // İstek seçeneklerini hazırla
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    };

    // Token ekle
    if (includeToken) {
      const token = getToken();
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
        console.log('API isteği: Token eklendi', { tokenLength: token.length });
      } else {
        console.warn('API isteği: Token bulunamadı');
        
        // Token yoksa bile devam et, hata fırlatma
        console.log('API isteği: Token olmadan devam ediliyor');
        
        // Eğer geliştirme ortamında çalışıyorsa, geçici bir token ekle
        if (process.env.NODE_ENV === 'development') {
          console.log('Geliştirme ortamında geçici token ekleniyor');
          options.headers = {
            ...options.headers,
            'Authorization': 'Bearer dev-token'  // Geliştirme için geçici token
          };
        }
      }
    }

    // Body ekle (GET ve HEAD istekleri hariç)
    if (data && !['GET', 'HEAD'].includes(method)) {
      options.body = JSON.stringify(data);
      console.log('API isteği: Body eklendi', { 
        bodySize: JSON.stringify(data).length,
        bodyPreview: JSON.stringify(data).substring(0, 100) + (JSON.stringify(data).length > 100 ? '...' : '')
      });
    }

    // İsteği gönder
    console.log('API isteği gönderiliyor...', { 
      url, 
      method, 
      headers: options.headers ? Object.keys(options.headers as Record<string, string>) : []
    });
    const response = await fetch(url, options);
    console.log('API yanıtı alındı:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok
    });

    // 401 Unauthorized hatası için kullanıcıyı giriş sayfasına yönlendir
    if (response.status === 401) {
      console.error('API isteği: Yetkilendirme hatası');
      
      // Geliştirme ortamında 401 hatası alınsa bile yönlendirme yapma
      if (process.env.NODE_ENV !== 'development') {
        redirectToLogin();
        // Üretim ortamında localStorage'ı temizle
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      } else {
        console.warn('Geliştirme ortamında 401 hatası alındı, ancak yönlendirme yapılmıyor');
      }
    }

    // Yanıtı işle
    let responseData;
    
    // Yanıtın bir kopyasını oluştur
    const responseClone = response.clone();
    
    try {
      // Önce JSON olarak ayrıştırmayı dene
      responseData = await response.json();
      console.log('API yanıt verisi:', responseData);
    } catch (jsonError) {
      console.error('API yanıtı JSON olarak ayrıştırılamadı:', jsonError);
      
      try {
        // JSON ayrıştırma başarısız olursa, metin olarak oku
        const text = await responseClone.text();
        console.warn('API yanıtı JSON değil:', text);
        responseData = { message: text || 'Sunucu yanıtı işlenemedi' };
      } catch (textError) {
        console.error('API yanıtı metin olarak da okunamadı:', textError);
        responseData = { message: 'Sunucu yanıtı işlenemedi' };
      }
    }

    // Başarısız yanıt için hata fırlat
    if (!response.ok) {
      const errorMessage = responseData.message || 'Bir hata oluştu';
      console.error('API yanıtı başarısız:', errorMessage);
      
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('API isteği sırasında hata:', error);
    
    // Hata detaylarını göster
    if (error instanceof Error) {
      console.error('Hata tipi:', error.name);
      console.error('Hata mesajı:', error.message);
      console.error('Hata stack:', error.stack);
    } else {
      console.error('Bilinmeyen hata türü:', typeof error);
    }
    
    throw error;
  }
};

// Kullanıcı kaydı
export const register = (userData: { username: string; email: string; password: string }) => {
  return apiRequest('auth/register', 'POST', userData, false);
};

// Kullanıcı girişi
export const login = (credentials: { email: string; password: string }) => {
  return apiRequest('auth/login', 'POST', credentials, false);
};

// Kullanıcı çıkışı
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    console.log('Kullanıcı çıkış yaptı, localStorage temizlendi');
  }
};

// Oturum durumunu kontrol et
export const checkAuth = () => {
  const token = getToken();
  return !!token; // Token varsa true, yoksa false döndür
};

export default {
  register,
  login,
  logout,
  checkAuth,
  apiRequest,
}; 