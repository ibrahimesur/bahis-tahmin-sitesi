import { useState } from 'react';

interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalEditors: number;
}

export default function AdminPage() {
  const [stats] = useState<AdminStats>({
    totalUsers: 1250,
    totalPredictions: 450,
    totalEditors: 8
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Admin Paneli</h1>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Toplam Tahmin</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalPredictions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">Toplam Editör</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalEditors}</p>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Yeni Editör Ekle
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Tahmin Onayla
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                Duyuru Ekle
              </button>
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Son Aktiviteler</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Yeni Editör Eklendi</p>
                  <p className="text-sm text-gray-500">Mustafa Eren Alkan</p>
                </div>
                <span className="text-sm text-gray-500">2 dk önce</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Tahmin Onaylandı</p>
                  <p className="text-sm text-gray-500">GS vs FB maçı</p>
                </div>
                <span className="text-sm text-gray-500">5 dk önce</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Yeni Üye</p>
                  <p className="text-sm text-gray-500">Mehmet Demir</p>
                </div>
                <span className="text-sm text-gray-500">10 dk önce</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 