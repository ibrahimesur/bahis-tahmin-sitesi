import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Navbar from '../../components/Navbar';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../../utils/api';
import Image from 'next/image';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
  membershipType: string;
  membershipExpiry?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchUserProfile();
  }, [user, router]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest(`users/${user?.id}`, 'GET');
      
      setProfile(response);
      setFormData({
        username: response.username || '',
        email: response.email || '',
        bio: response.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      if (response.avatar) {
        setAvatarPreview(response.avatar);
      }
    } catch (error) {
      console.error('Profil bilgileri alınırken hata:', error);
      toast.error('Profil bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Dosya önizlemesi oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Şifre kontrolü
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      setIsSaving(true);
      
      // Form verilerini hazırla
      const updateData: any = {
        username: formData.username,
        bio: formData.bio,
      };
      
      // Şifre değişikliği varsa ekle
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      // Profil güncelleme isteği
      const response = await apiRequest(`users/${user?.id}`, 'PUT', updateData);
      
      // Avatar yükleme işlemi
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        await fetch(`/api/users/${user?.id}/avatar`, {
          method: 'POST',
          body: formData,
        });
      }
      
      // Kullanıcı bilgilerini güncelle
      if (updateUser) {
        updateUser({
          ...user!,
          username: formData.username,
        });
      }
      
      toast.success('Profil başarıyla güncellendi');
      fetchUserProfile(); // Güncel bilgileri yeniden yükle
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast.error('Profil güncellenemedi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Navbar>
          <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </Navbar>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <Navbar>
          <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil Bulunamadı</h1>
                <p className="text-gray-600 mb-6">Profil bilgilerinize erişilemiyor.</p>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            </div>
          </div>
        </Navbar>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600">
                <h1 className="text-3xl font-bold text-white">Profil Düzenle</h1>
                <p className="text-blue-100 mt-2">Hesap bilgilerinizi güncelleyin</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                {/* Avatar Bölümü */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative w-32 h-32">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Profil Resmi"
                        fill
                        className="rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-200">
                        <span className="text-4xl text-gray-500">
                          {profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profil Resmi
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF formatında maksimum 2MB boyutunda dosya yükleyebilirsiniz.
                    </p>
                  </div>
                </div>
                
                {/* Kullanıcı Bilgileri */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      E-posta adresinizi değiştirmek için destek ekibiyle iletişime geçin.
                    </p>
                  </div>
                </div>
                
                {/* Biyografi */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Biyografi
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Kendiniz hakkında kısa bir bilgi yazın..."
                  />
                </div>
                
                {/* Şifre Değiştirme */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Şifre Değiştir</h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Mevcut Şifre
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Yeni Şifre
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Yeni Şifre (Tekrar)
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Üyelik Bilgileri */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Üyelik Bilgileri</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Üyelik Tipi: <span className="font-bold text-blue-600">{profile.membershipType === 'premium' ? 'Premium' : 'Ücretsiz'}</span>
                        </p>
                        {profile.membershipExpiry && profile.membershipType === 'premium' && (
                          <p className="text-sm text-gray-500 mt-1">
                            Bitiş Tarihi: {new Date(profile.membershipExpiry).toLocaleDateString('tr-TR')}
                          </p>
                        )}
                      </div>
                      
                      {profile.membershipType !== 'premium' && (
                        <button
                          type="button"
                          onClick={() => router.push('/membership')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Premium'a Yükselt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Kaydet Butonu */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Değişiklikleri Kaydet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Navbar>
    </Layout>
  );
} 