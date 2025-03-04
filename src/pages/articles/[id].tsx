import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ArticleDetail {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: string;
  createdAt: string;
  likes: number;
  author: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string;
  };
  comments: Comment[];
}

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchArticleDetail();
  }, [id]);

  const fetchArticleDetail = async () => {
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) throw new Error('Makale yüklenemedi');
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      console.error('Makale detayı yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/articles/${id}/like`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Beğeni işlemi başarısız');
      const data = await response.json();
      setArticle(prev => prev ? { ...prev, likes: data.likes } : null);
    } catch (error) {
      console.error('Beğeni işlemi sırasında hata:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      });
      if (!response.ok) throw new Error('Yorum eklenemedi');
      const newComment = await response.json();
      setArticle(prev => prev ? {
        ...prev,
        comments: [newComment, ...prev.comments]
      } : null);
      setComment('');
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bu Sayfayı Görüntülemek İçin Giriş Yapın
          </h2>
          <p className="text-gray-600 mb-6">
            Yazıyı okumak için üye olun veya giriş yapın.
          </p>
          {/* ... giriş/kayıt butonları ... */}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            {/* ... loading state ... */}
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {article.image && (
            <div className="relative h-64 w-full">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Link href={`/editors/${article.author.id}`}>
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    {article.author.avatar ? (
                      <Image
                        src={article.author.avatar}
                        alt={article.author.username}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xl text-gray-500">
                          {article.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{article.author.username}</div>
                    <div className="text-sm text-gray-500">{article.author.bio || 'Editör'}</div>
                  </div>
                </div>
              </Link>
              <div className="text-sm text-gray-500">
                {new Date(article.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <div className="prose max-w-none">{article.content}</div>

            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                >
                  <span>👍 {article.likes}</span>
                </button>
                <span className="text-sm font-medium text-blue-600">{article.category}</span>
              </div>
            </div>
          </div>
        </article>

        {/* Yorumlar */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Yorumlar</h2>
          
          {/* Yorum formu */}
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Yorum Yap
            </button>
          </form>

          {/* Yorum listesi */}
          <div className="space-y-6">
            {article.comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative w-8 h-8">
                    {comment.author.avatar ? (
                      <Image
                        src={comment.author.avatar}
                        alt={comment.author.username}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          {comment.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{comment.author.username}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 