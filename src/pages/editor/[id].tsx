import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function EditorProfile() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-gray-200">
              {/* Editör avatarı */}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Editör Adı</h1>
              <p className="text-gray-600">Başarı Oranı: %75</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Son Tahminler</h2>
            {/* Tahmin listesi */}
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Köşe Yazıları</h2>
            {/* Köşe yazıları listesi */}
          </div>
        </div>
      </div>
    </Layout>
  );
} 