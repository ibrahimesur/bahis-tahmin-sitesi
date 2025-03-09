// API istekleri için utility fonksiyonlar

// API endpoint'ler için temel URL
// Geliştirme ortamında: http://localhost:3005/api
// Üretim ortamında: /api
const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3005/api'
    : '/api';

// Kimlik doğrulama token'ını local storage'dan al
export const getToken = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    console.log('localStorage user:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Parsed user:', { ...user, token: user.token ? `${user.token.substring(0, 10)}...` : null });
        
        if (!user.token) {
          console.warn('Token bulunamadı! Kullanıcı nesnesinde token yok.');
          // Kullanıcıyı yeniden giriş yapmaya yönlendir
          if (typeof window !== 'undefined') {
            alert('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
            localStorage.removeItem('user');
            window.location.href = '/giris';
          }
          return null;
        }
        
        return user.token;
      } catch (error) {
        console.error('Token alınırken hata:', error);
        // Kullanıcıyı yeniden giriş yapmaya yönlendir
        if (typeof window !== 'undefined') {
          alert('Oturumunuzla ilgili bir sorun oluştu. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('user');
          window.location.href = '/giris';
        }
        return null;
      }
    } else {
      console.warn('localStorage\'da user bilgisi bulunamadı!');
      // Kullanıcıyı giriş sayfasına yönlendir
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/giris')) {
        alert('Lütfen giriş yapın.');
        window.location.href = '/giris';
      }
    }
  }
  return null;
};

// HTTP isteği için header'ları oluştur
export const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header added:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.warn('Token olmadığı için Authorization header eklenemedi!');
    }
  }

  console.log('Request headers:', headers);
  return headers;
};

// Genel API istek fonksiyonu
export const apiRequest = async (
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  includeAuth: boolean = true
) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  console.log(`API isteği: ${method} ${url}`);
  
  const options: RequestInit = {
    method,
    headers: getHeaders(includeAuth),
    credentials: 'same-origin',
    mode: 'cors'
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
    console.log('Gönderilen veri:', data);
  }

  try {
    console.log('Fetch isteği başlatılıyor:', { 
      url, 
      method,
      headers: options.headers,
      hasBody: !!options.body
    });
    
    const response = await fetch(url, options);
    
    console.log('Fetch yanıtı alındı:', { 
      status: response.status, 
      statusText: response.statusText,
      headers: Array.from(response.headers.entries()).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, string>)
    });
    
    // Yanıt durumunu kontrol et
    if (!response.ok) {
      // Yanıt JSON değilse hata mesajını almaya çalış
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('API hatası (JSON):', errorData);
        throw new Error(errorData.message || `Sunucu hatası: ${response.status}`);
      } else {
        const errorText = await response.text();
        console.error('API hatası (Text):', errorText);
        throw new Error(`Sunucu hatası (${response.status}): ${errorText || response.statusText}`);
      }
    }
    
    // JSON yanıtı ayrıştır
    const result = await response.json();
    console.log('API yanıtı:', result);
    
    return result;
  } catch (error) {
    // Hata yönetimi
    console.error('API isteği hatası:', error);
    
    // Ağ hatalarını daha açıklayıcı hale getir
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin. Hata: ${error.message}`);
    }
    
    // Token hatalarında kullanıcıyı giriş sayfasına yönlendir
    if (error instanceof Error && 
        (error.message.includes('token') || 
         error.message.includes('Token') || 
         error.message.includes('yetki') || 
         error.message.includes('Yetki'))) {
      if (typeof window !== 'undefined') {
        console.warn('Token hatası nedeniyle kullanıcı giriş sayfasına yönlendiriliyor');
        localStorage.removeItem('user');
        // Sayfayı hemen yönlendirme, kullanıcının hatayı görmesine izin ver
        setTimeout(() => {
          window.location.href = '/giris';
        }, 3000);
      }
    }
    
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
    localStorage.removeItem('token');
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