import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode } from 'react';

interface NavbarProps {
  children?: ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Maçlar', href: '/matches' },
    { name: 'Puan Durumu', href: '/standings' },
    { name: 'Tahminler', href: '/tahminler' }
  ];

  // Editör rolüne sahip kullanıcılar için ek menü öğeleri
  const editorNavigation = user && (user.role === 'editor' || user.role === 'admin') ? [
    { name: 'Yayın Yönetimi', href: '/editor/dashboard' }
  ] : [];

  // Tüm navigasyon öğelerini birleştir
  const allNavigation = [...navigation, ...editorNavigation];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Dikey Navbar - Sol Tarafta */}
      <nav className="bg-white shadow-lg w-full md:w-64 md:min-h-screen">
        <div className="p-4">
          {/* Logo - BankoLab yazısı kaldırıldı */}
          <div className="flex justify-center mb-8 mt-4">
            <Link href="/">
              <Image 
                src="/images/logo.png" 
                alt="BankoLab Logo" 
                width={100} 
                height={100} 
                className="w-auto h-auto"
                priority={true}
                quality={80}
                sizes="(max-width: 768px) 80px, 100px"
              />
            </Link>
          </div>

          {/* Dikey Navigasyon Menüsü */}
          <div className="flex flex-col space-y-4">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${
                  router.pathname === item.href || router.pathname.startsWith(`${item.href}/`)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Giriş/Çıkış Butonları */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {user ? (
              <div className="space-y-4">
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center">
                    <span>{user.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  href="/auth/login"
                  className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full flex items-center px-4 py-3 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobil Menü Butonu */}
        <div className="md:hidden absolute top-4 right-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">Menüyü aç</span>
            <svg
              className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobil Menü - Sadece Mobil Görünümde */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-50 bg-white pt-16`}>
        <div className="p-4">
          <div className="space-y-2">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 text-base font-medium rounded-md ${
                  router.pathname === item.href || router.pathname.startsWith(`${item.href}/`)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <span>{user.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/login"
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-3 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 md:ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
} 