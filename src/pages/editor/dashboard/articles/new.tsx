import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../contexts/AuthContext';
import Layout from '../../../../components/Layout';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { apiRequest } from '../../../../utils/api';

export default function NewArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'genel',
    image: ''
  });

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa veya editör değilse yönlendir
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'editor' && user.role !== 'admin') {
      toast.error('Bu sayfaya erişim yetkiniz yok');
      router.push('/');
      return;
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Başlık ve içerik alanları zorunludur');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Makale oluşturma isteği gönderiliyor:', formData);
      
      // apiRequest fonksiyonunu kullanarak istek yap
      const data = await apiRequest('articles', 'POST', formData);
      console.log('Makale oluşturma yanıtı:', data);
      
      toast.success('Makale başarıyla oluşturuldu');
      router.push(`/editor/dashboard/articles/${data.id}`);
    } catch (error) {
      console.error('Makale oluşturulurken hata:', error);
      toast.error(error instanceof Error ? error.message : 'Makale oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Yeni Makale Oluştur</h3>
                <Link
                  href="/editor/dashboard"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Geri Dön
                </Link>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Makalenizi oluşturmak için aşağıdaki formu doldurun.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Başlık
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Makalenizin başlığını girin"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="genel">Genel</option>
                  <option value="futbol">Futbol</option>
                  <option value="basketbol">Basketbol</option>
                  <option value="tenis">Tenis</option>
                  <option value="analiz">Analiz</option>
                  <option value="strateji">Strateji</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Kapak Görseli URL (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  name="image"
                  id="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Makaleniz için bir kapak görseli URL'si girin. Boş bırakırsanız varsayılan görsel kullanılacaktır.
                </p>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  İçerik
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={15}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Makalenizin içeriğini buraya yazın..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Markdown formatını kullanabilirsiniz. Örneğin: **kalın**, *italik*, [link](https://example.com)
                </p>
              </div>
              
              <div className="flex justify-end">
                <Link
                  href="/editor/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yayınlanıyor...
                    </>
                  ) : (
                    'Makaleyi Yayınla'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 