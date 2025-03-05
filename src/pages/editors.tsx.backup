import { useState } from 'react';
import Layout from '../components/Layout';

export default function EditorsPage() {
  const [editorName, setEditorName] = useState('');
  const [editors, setEditors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddEditor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editorName.trim()) {
      setError('Editör adı boş olamaz');
      return;
    }

    if (editors.includes(editorName.trim())) {
      setError('Bu editör zaten eklenmiş');
      return;
    }

    setEditors([...editors, editorName.trim()]);
    setEditorName('');
    setError(null);
  };

  const handleRemoveEditor = (name: string) => {
    setEditors(editors.filter(editor => editor !== name));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Editör Yönetimi</h1>

          {/* Editör Ekleme Formu */}
          <form onSubmit={handleAddEditor} className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-4">
              <label htmlFor="editorName" className="block text-sm font-medium text-gray-700 mb-2">
                Editör Adı
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="editorName"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Editör adını girin"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ekle
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </form>

          {/* Editör Listesi */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Editörler</h2>
              {editors.length === 0 ? (
                <p className="text-gray-500">Henüz editör eklenmemiş</p>
              ) : (
                <div className="space-y-3">
                  {editors.map((editor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{editor}</span>
                      <button
                        onClick={() => handleRemoveEditor(editor)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 