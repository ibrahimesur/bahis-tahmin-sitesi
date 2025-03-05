// API istekleri için utility fonksiyonlar

// API endpoint'ler için temel URL
// Geliştirme ortamında: http://localhost:8888/.netlify/functions
// Üretim ortamında: /.netlify/functions
const API_BASE_URL = 
  process.env.NODE_ENV === 'development' 
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
  
  const options: RequestInit = {
    method,
    headers: getHeaders(includeAuth),
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // JSON yanıtı ayrıştır
    const result = await response.json();
    
    // Başarısız yanıt için hata fırlat
    if (!response.ok) {
      throw new Error(result.message || 'Bilinmeyen hata oluştu');
    }
    
    return result;
  } catch (error) {
    // Hata yönetimi
    console.error('API isteği hatası:', error);
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