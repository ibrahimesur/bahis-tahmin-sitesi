import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

interface EditorGuardProps {
  children: React.ReactNode;
}

const EditorGuard: React.FC<EditorGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Kullanıcı yüklendikten sonra kontrol et
    if (!isLoading) {
      // Kullanıcı giriş yapmamışsa veya editör değilse ana sayfaya yönlendir
      if (!user) {
        router.push('/giris?redirect=' + encodeURIComponent(router.asPath));
      } else if (user.role !== 'editor' && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  // Yükleme durumunda veya kullanıcı kontrolü sırasında boş içerik göster
  if (isLoading || !user || (user.role !== 'editor' && user.role !== 'admin')) {
    return null;
  }

  // Kullanıcı editör veya admin ise içeriği göster
  return <>{children}</>;
};

export default EditorGuard; 