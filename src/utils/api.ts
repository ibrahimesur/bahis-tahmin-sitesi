// API istekleri için utility fonksiyonlar

// API endpoint'ler için temel URL
// Geliştirme ortamında: http://localhost:3000/api
// Üretim ortamında: /api
const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? '/api'  // Localde de /api kullan, Next.js API rotalarını kullanacağız
    : '/api';

// Kimlik doğrulama token'ını local storage'dan al
export const getToken = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    console.log('localStorage user:', userStr ? 'Mevcut' : 'Bulunamadı');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Token kontrolü
        if (!user || !user.token) {
          console.warn('Token bulunamadı! Kullanıcı nesnesinde token yok.');
          return null;
        }
        
        console.log('Token alındı:', user.token.substring(0, 10) + '...');
        return user.token;
      } catch (error) {
        console.error('Token alınırken hata:', error);
        return null;
      }
    } else {
      console.warn('localStorage\'da user bilgisi bulunamadı!');
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
    credentials: 'include',
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
    });
    
    // 401 Unauthorized hatası - token sorunu
    if (response.status === 401) {
      console.error('Yetkilendirme hatası: Geçersiz veya eksik token');
      
      if (typeof window !== 'undefined') {
        // Kullanıcıyı giriş sayfasına yönlendirmeden önce uyarı göster
        alert('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('user');
        window.location.href = '/giris';
        throw new Error('Yetkilendirme başarısız: Geçersiz token');
      }
    }
    
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