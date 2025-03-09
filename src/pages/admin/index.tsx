import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Link from 'next/link';

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Kullanıcı yüklendikten sonra kontrol et
    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null; // Router zaten yönlendirme yapacak
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Paneli</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Kullanıcı Yönetimi Kartı */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Kullanıcı Yönetimi</h2>
            <p className="text-gray-600 mb-4">
              Tüm kullanıcıları görüntüleyin, düzenleyin ve rollerini değiştirin.
            </p>
            <Link href="/admin/users" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Kullanıcıları Yönet
            </Link>
          </div>

          {/* Editör Yönetimi Kartı */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Editör Yönetimi</h2>
            <p className="text-gray-600 mb-4">
              Yeni editörler ekleyin ve mevcut editörleri yönetin.
            </p>
            <Link href="/admin/add-editor" className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Yeni Editör Ekle
            </Link>
          </div>

          {/* İçerik Yönetimi Kartı */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">İçerik Yönetimi</h2>
            <p className="text-gray-600 mb-4">
              Makaleler, tahminler ve diğer içerikleri yönetin.
            </p>
            <Link href="/admin/content" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
              İçerikleri Yönet
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Admin Yapma</h3>
              <p className="text-sm text-gray-600 mb-2">
                Bir kullanıcıyı doğrudan admin yapmak için:
              </p>
              <div className="bg-gray-100 p-2 rounded text-xs mb-4 overflow-x-auto">
                <code>
                  https://www.bankolab.com/.netlify/functions/make-admin?email=kullanici@email.com&secretKey=Mashurov2002
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Editör Yapma</h3>
              <p className="text-sm text-gray-600 mb-2">
                Bir kullanıcıyı doğrudan editör yapmak için:
              </p>
              <div className="bg-gray-100 p-2 rounded text-xs mb-4 overflow-x-auto">
                <code>
                  https://www.bankolab.com/.netlify/functions/make-editor?email=kullanici@email.com&secretKey=Mashurov2002
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard; 