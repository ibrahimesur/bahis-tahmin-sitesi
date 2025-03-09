import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'editor' | 'admin';
  createdAt: string;
}

const AdminUsersPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'editor' | 'admin'>('user');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Kullanıcı yüklendikten sonra kontrol et
    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchUsers();
    }
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Kullanıcı oturum kontrolü
      if (!user || !user.token) {
        console.error('Kullanıcı oturumu bulunamadı veya token yok!', { user });
        toast.error('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
        router.push('/giris');
        return;
      }
      
      console.log('Kullanıcılar getiriliyor...', { 
        userRole: user.role,
        tokenLength: user.token.length,
        token: user.token.substring(0, 10) + '...'
      });
      
      // API endpoint'i düzeltildi
      const apiUrl = '/api/admin/users';
      console.log('API isteği yapılıyor:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      console.log('API yanıtı alındı:', { 
        status: response.status, 
        statusText: response.statusText 
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Yetkilendirme hatası: Geçersiz veya eksik token');
          toast.error('Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.');
          
          // Kullanıcı bilgilerini temizle
          localStorage.removeItem('user');
          
          // Giriş sayfasına yönlendir
          router.push('/giris');
          throw new Error('Yetkilendirme başarısız: Geçersiz token');
        }
        
        // Yanıt içeriğini al
        const errorText = await response.text();
        console.error('API hatası:', { status: response.status, text: errorText });
        
        try {
          // JSON olarak ayrıştırmayı dene
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Kullanıcılar yüklenirken bir hata oluştu');
        } catch (parseError) {
          // JSON ayrıştırma hatası
          throw new Error(`Sunucu hatası (${response.status}): ${errorText || response.statusText}`);
        }
      }

      // Yanıt içeriğini al
      const responseText = await response.text();
      let data;
      
      try {
        // JSON olarak ayrıştırmayı dene
        data = JSON.parse(responseText);
        console.log('Kullanıcılar başarıyla alındı', { count: data.users?.length || 0 });
      } catch (parseError) {
        console.error('JSON ayrıştırma hatası:', parseError, responseText);
        throw new Error('Sunucu yanıtı geçersiz format içeriyor');
      }
      
      if (!data.users) {
        console.error('API yanıtında users alanı bulunamadı:', data);
        throw new Error('Sunucu yanıtında kullanıcı bilgisi eksik');
      }
      
      setUsers(data.users);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      toast.error(error instanceof Error ? error.message : 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (userId: string, role: 'user' | 'editor' | 'admin') => {
    setSelectedUser(userId);
    setSelectedRole(role);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          userId,
          newRole
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Kullanıcı rolü güncellenirken bir hata oluştu');
      }

      const data = await response.json();
      toast.success('Kullanıcı rolü başarıyla güncellendi');
      
      // Kullanıcı listesini güncelle
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as 'user' | 'editor' | 'admin' } : u
      ));
      
      setSelectedUser(null);
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Kullanıcı rolü güncellenirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Router zaten yönlendirme yapacak
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>

        {isLoading ? (
          <p>Kullanıcılar yükleniyor...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {selectedUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as 'user' | 'editor' | 'admin')}
                            className="block w-24 py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            disabled={isUpdating}
                          >
                            <option value="user">Kullanıcı</option>
                            <option value="editor">Editör</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => updateUserRole(user.id, selectedRole)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isUpdating || user.role === selectedRole}
                          >
                            {isUpdating ? 'Güncelleniyor...' : 'Kaydet'}
                          </button>
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isUpdating}
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Rolü Değiştir
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
    </Layout>
  );
};

export default AdminUsersPage; 