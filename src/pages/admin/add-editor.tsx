import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../../utils/api';

const AddEditorPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    // Kullanıcı yüklendikten sonra kontrol et
    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [user, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Lütfen bir e-posta adresi girin');
      return;
    }

    try {
      // Kullanıcı oturum kontrolü
      if (!user || !user.token) {
        console.error('Kullanıcı oturumu bulunamadı veya token yok!', { user });
        toast.error('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
        router.push('/giris');
        return;
      }

      console.log('Arama başlatılıyor:', { email, userRole: user.role });
      setIsSubmitting(true);
      setSearchPerformed(true);
      
      // apiRequest fonksiyonunu kullanarak API çağrısı yapıyoruz
      const data = await apiRequest(`admin/users/search?email=${encodeURIComponent(email)}`, 'GET');
      console.log('Arama sonuçları:', data);
      
      setSearchResults(data.users);

      // Kullanıcı bulunamadıysa bildir
      if (data.users.length === 0) {
        toast.error('Bu e-posta adresine sahip kullanıcı bulunamadı');
      }
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Kullanıcı aranırken bir hata oluştu');
      setSearchResults([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const makeEditor = async (userId: string) => {
    try {
      // Kullanıcı oturum kontrolü
      if (!user || !user.token) {
        console.error('Kullanıcı oturumu bulunamadı veya token yok!', { user });
        toast.error('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
        router.push('/giris');
        return;
      }

      console.log('Editör yapma işlemi başlatılıyor:', { userId, userRole: user.role });
      setIsSubmitting(true);
      
      // apiRequest fonksiyonunu kullanarak API çağrısı yapıyoruz
      const data = await apiRequest('admin/users/update-role', 'POST', {
        userId,
        newRole: 'editor'
      });
      
      console.log('Editör yapma sonucu:', data);
      toast.success(data.message || 'Kullanıcı başarıyla editör yapıldı');
      
      // Sonuçları güncelle
      setSearchResults(searchResults.map(user => 
        user.id === userId ? { ...user, role: 'editor' } : user
      ));
    } catch (error) {
      console.error('Editör yapma hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Kullanıcı editör yapılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Router zaten yönlendirme yapacak
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link href="/admin" className="mr-4 text-blue-600 hover:text-blue-800">
            ← Admin Paneline Dön
          </Link>
          <h1 className="text-2xl font-bold">Yeni Editör Ekle</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Kullanıcı E-posta Adresi
              </label>
              <div className="flex">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ornek@email.com"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Aranıyor...' : 'Ara'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Editör yapmak istediğiniz kullanıcının e-posta adresini girin.
              </p>
            </div>
          </form>

          {searchPerformed && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Arama Sonuçları</h2>
              
              {searchResults.length === 0 ? (
                <p className="text-gray-500">Kullanıcı bulunamadı. Lütfen e-posta adresini kontrol edin.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="py-3 px-4 text-left">Kullanıcı Adı</th>
                        <th className="py-3 px-4 text-left">E-posta</th>
                        <th className="py-3 px-4 text-left">Rol</th>
                        <th className="py-3 px-4 text-left">Kayıt Tarihi</th>
                        <th className="py-3 px-4 text-left">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">{user.username}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : user.role === 'editor' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'editor' ? 'Editör' : 'Kullanıcı'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                          <td className="py-3 px-4">
                            {user.role === 'editor' ? (
                              <span className="text-green-600">Zaten Editör</span>
                            ) : user.role === 'admin' ? (
                              <span className="text-purple-600">Admin</span>
                            ) : (
                              <button
                                onClick={() => makeEditor(user.id)}
                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? 'İşleniyor...' : 'Editör Yap'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Alternatif Yöntem</h2>
          <p className="mb-4">
            Ayrıca, aşağıdaki URL'yi kullanarak doğrudan bir kullanıcıyı editör yapabilirsiniz:
          </p>
          <div className="bg-gray-100 p-3 rounded-lg mb-4 overflow-x-auto">
            <code>
              https://www.bankolab.com/.netlify/functions/make-editor?email=kullanici@email.com&secretKey=Mashurov2002
            </code>
          </div>
          <p className="text-sm text-gray-500">
            Not: Bu URL'deki "kullanici@email.com" kısmını editör yapmak istediğiniz kullanıcının e-posta adresiyle değiştirin.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AddEditorPage; 