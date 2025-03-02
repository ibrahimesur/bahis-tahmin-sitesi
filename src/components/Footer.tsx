import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Tahmin Merkezi</h3>
            <p className="text-gray-400">
              En güncel bahis tahminleri ve analizleri
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tahminler" className="text-gray-400 hover:text-white">
                  Tahminler
                </Link>
              </li>
              <li>
                <Link href="/istatistikler" className="text-gray-400 hover:text-white">
                  İstatistikler
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-400 hover:text-white">
                  Premium Üyelik
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@tahminmerkezi.com</li>
              <li>Tel: +90 555 555 5555</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Tahmin Merkezi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
} 