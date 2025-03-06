// API istekleri için utility fonksiyonlar

// API endpoint'ler için temel URL
// Geliştirme ortamında: http://localhost:8888/.netlify/functions
// Üretim ortamında: /.netlify/functions
const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8888/.netlify/functions'
    : '/.netlify/functions';

// Kimlik doğrulama token'ını local storage'dan al
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// HTTP isteği için header'ları oluştur
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Genel API istek fonksiyonu
const apiRequest = async (
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
    console.log('Fetch isteği başlatılıyor:', { url, options: { ...options, headers: { ...options.headers } } });
    const response = await fetch(url, options);
    console.log('Fetch yanıtı alındı:', { status: response.status, statusText: response.statusText });
    
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