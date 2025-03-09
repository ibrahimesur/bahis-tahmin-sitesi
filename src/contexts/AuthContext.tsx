import { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updatedUser: AuthUser) => void;
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
        const userData = JSON.parse(storedUser);
        console.log('AuthContext: Kullanıcı bilgisi alındı', { 
          id: userData.id,
          role: userData.role,
          hasToken: !!userData.token,
          tokenLength: userData.token ? userData.token.length : 0
        });
        setUser(userData);
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
      hasToken: !!userData.token
    });
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('AuthContext: Kullanıcı çıkış yapıyor');
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: AuthUser) => {
    console.log('AuthContext: Kullanıcı bilgileri güncelleniyor', {
      id: updatedUser.id,
      username: updatedUser.username
    });
    setUser(updatedUser);
    
    // localStorage'daki kullanıcı bilgilerini güncelle
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 