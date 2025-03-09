import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Router from 'next/router';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updatedUser: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  updateUser: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
    try {
      const storedUser = localStorage.getItem('user');
      console.log('AuthContext: localStorage kontrol ediliyor', { 
        userExists: !!storedUser 
      });
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('AuthContext: Kullanıcı bilgisi alındı', { 
            id: userData.id,
            role: userData.role,
            hasToken: !!userData.token,
            tokenLength: userData.token ? userData.token.length : 0
          });
          
          // Token kontrolü
          if (!userData.token) {
            console.warn('AuthContext: Token bulunamadı, kullanıcı oturumu geçersiz');
            
            // Geliştirme ortamında token yoksa bile kullanıcıyı ayarla
            if (process.env.NODE_ENV === 'development') {
              console.log('Geliştirme ortamında token olmadan devam ediliyor');
              setUser(userData);
            } else {
              // Üretim ortamında localStorage'ı temizle
              localStorage.removeItem('user');
            }
          } else {
            setUser(userData);
          }
        } catch (parseError) {
          console.error('AuthContext: JSON ayrıştırma hatası', parseError);
          // Bozuk veriyi temizle
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('AuthContext: localStorage okuma hatası', error);
      // Bozuk veriyi temizle
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: AuthUser) => {
    console.log('AuthContext: Kullanıcı giriş yapıyor', { 
      id: userData.id,
      role: userData.role,
      hasToken: !!userData.token,
      tokenLength: userData.token ? userData.token.length : 0
    });
    
    // Token kontrolü - tokensiz de devam et, hata fırlatma
    if (!userData.token) {
      console.warn('AuthContext: Kullanıcı tokensiz giriş yapıyor');
      
      // Token yoksa boş string ekle
      userData = {
        ...userData,
        token: ''
      };
    }
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    toast.success('Başarıyla giriş yaptınız');
  };

  const logout = () => {
    console.log('AuthContext: Kullanıcı çıkış yapıyor');
    setUser(null);
    localStorage.removeItem('user');
    Router.push('/');
    toast.success('Başarıyla çıkış yaptınız');
  };

  const updateUser = (updatedUser: Partial<AuthUser>) => {
    if (!user) {
      console.error('AuthContext: Kullanıcı güncellenirken kullanıcı bulunamadı');
      return;
    }
    
    console.log('AuthContext: Kullanıcı güncelleniyor', updatedUser);
    
    const newUserData = { ...user, ...updatedUser };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 