import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import Layout from '../../../components/Layout';
import { toast } from 'react-hot-toast';
import EditorGuard from '../../../components/editor/EditorGuard';

const NewArticle = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'news',
    image: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Burada gerçek API çağrısı yapılacak
      // Şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada:
      // const response = await fetch('/api/editor/articles', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${user?.token}`
      //   },
      //   body: JSON.stringify({
      //     ...formData,
      //     authorId: user?.id
      //   })
      // });
      // 
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Yazı eklenirken bir hata oluştu');
      // }

      toast.success('Yazı başarıyla eklendi');
      router.push('/editor/dashboard');
    } catch (error) {
      console.error('Yazı eklenirken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Yazı eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EditorGuard>
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()} 
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              ← Geri
            </button>
            <h1 className="text-2xl font-bold">Yeni Yazı Ekle</h1>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Başlık <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="news">Haber</option>
                  <option value="analysis">Analiz</option>
                  <option value="column">Köşe Yazısı</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
                  Görsel URL (isteğe bağlı)
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                  İçerik <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 mr-2"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Ekleniyor...' : 'Yazıyı Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </EditorGuard>
  );
};

export default NewArticle; 