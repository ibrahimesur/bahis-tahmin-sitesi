﻿import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BankoLab</h3>
            <p className="text-gray-300">
              En güncel bahis tahminleri ve analizleri ile kazanmanıza yardımcı oluyoruz.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-gray-300 hover:text-white">
                  Maçlar
                </Link>
              </li>
              <li>
                <Link href="/standings" className="text-gray-300 hover:text-white">
                  Puan Durumu
                </Link>
              </li>
              <li>
                <Link href="/tahminler" className="text-gray-300 hover:text-white">
                  Tahminler
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">İletişim</h3>
            <p className="text-gray-300">
              Sorularınız için bize ulaşın:
              <br />
              <a href="mailto:info@bankolab.com" className="hover:text-white">
                info@bankolab.com
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BankoLab. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
