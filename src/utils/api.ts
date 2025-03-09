// API istekleri için yardımcı fonksiyonlar
import { toast } from 'react-hot-toast';
import Router from 'next/router';

// API temel URL'si
const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin + '/api/' 
  : 'http://localhost:3000/api/';

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
    const user = JSON.parse(userStr);
    
    if (!user || !user.token) {
      console.log('getToken: Token bulunamadı', { user });
      return null;
    }
    
    console.log('getToken: Token bulundu', { tokenLength: user.token.length });
    return user.token;
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
    console.log(`API isteği: ${method} ${endpoint}`, { data });
    
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
        // Token yoksa ve token gerekiyorsa, kullanıcıyı giriş sayfasına yönlendir
        if (typeof window !== 'undefined') {
          toast.error('Oturum süresi doldu, lütfen tekrar giriş yapın');
          Router.push('/giris');
          throw new Error('Token bulunamadı');
        }
      }
    }

    // Body ekle (GET ve HEAD istekleri hariç)
    if (data && !['GET', 'HEAD'].includes(method)) {
      options.body = JSON.stringify(data);
    }

    // İsteği gönder
    const response = await fetch(url, options);
    console.log('API yanıtı:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok
    });

    // 401 Unauthorized hatası için kullanıcıyı giriş sayfasına yönlendir
    if (response.status === 401) {
      console.error('API isteği: Yetkilendirme hatası');
      if (typeof window !== 'undefined') {
        toast.error('Oturum süresi doldu, lütfen tekrar giriş yapın');
        localStorage.removeItem('user');
        Router.push('/giris');
      }
      throw new Error('Yetkilendirme başarısız');
    }

    // Yanıtı JSON olarak parse etmeyi dene
    let responseData;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // JSON olmayan yanıt için metin olarak al
        const text = await response.text();
        console.warn('API yanıtı JSON değil:', text);
        responseData = { message: text };
      }
    } catch (error) {
      console.error('API yanıtı JSON olarak ayrıştırılamadı:', error);
      const text = await response.text();
      console.warn('Ham yanıt:', text);
      responseData = { message: 'Sunucu yanıtı işlenemedi' };
    }

    console.log('API yanıt verisi:', responseData);

    // Başarısız yanıt için hata fırlat
    if (!response.ok) {
      const errorMessage = responseData.message || 'Bir hata oluştu';
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('API isteği sırasında hata:', error);
    throw error;
  }
};

// Kullanıcı kaydı
export const register = (userData: { username: string; email: string; password: string }) => {
  return apiRequest('auth-register', 'POST', userData, false);
};

// Kullanıcı girişi
export const login = (credentials: { email: string; password: string }) => {
  return apiRequest('auth-login', 'POST', credentials, false);
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