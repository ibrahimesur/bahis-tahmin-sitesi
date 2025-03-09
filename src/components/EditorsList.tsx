import Link from 'next/link';

// User tipini doğrudan tanımlıyoruz
interface Editor {
  id: string;
  username: string;
  successRate?: number;
  avatar?: string;
}

export default function EditorsList() {
  // Örnek editör verileri
  const editors: Editor[] = [
    {
      id: '1',
      username: 'Ahmet Yılmaz',
      successRate: 82,
      avatar: '/avatars/editor1.jpg',
    },
    {
      id: '2',
      username: 'Mehmet Demir',
      successRate: 78,
      avatar: '/avatars/editor2.jpg',
    },
    {
      id: '3',
      username: 'Ayşe Kaya',
      successRate: 75,
      avatar: '/avatars/editor3.jpg',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Editörlerimiz</h2>
        <Link 
          href="/tahminler" 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Tümünü Gör
        </Link>
      </div>

      <div className="space-y-4">
        {editors.map((editor) => (
          <Link
            key={editor.id}
            href={`/editor/${editor.id}`}
            className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="relative w-12 h-12">
              <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                {editor.avatar ? (
                  <img
                    src={editor.avatar}
                    alt={editor.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {editor.username?.charAt(0)}
                  </div>
                )}
              </div>
              {editor.successRate && editor.successRate >= 80 && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{editor.username}</h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Başarı:</span>
                  <span className={`ml-1 text-sm font-medium ${
                    (editor.successRate || 0) >= 75 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    %{editor.successRate}
                  </span>
                </div>
                <div className="flex items-center ml-4">
                  <span className="text-sm text-gray-500">Tahmin:</span>
                  <span className="ml-1 text-sm text-gray-600">147</span>
                </div>
              </div>
            </div>

            <div className="ml-auto">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="text-center">
          <Link
            href="/editor/apply"
            className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Editör Ol
          </Link>
        </div>
      </div>
    </div>
  );
} 