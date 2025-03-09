import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>BankoLab - Bahis Tahmin Sitesi</title>
        <meta name="description" content="Futbol bahis tahminleri, canlı skorlar ve puan durumları" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e40af" />
        <link rel="icon" href="/images/logo2.jpg" />
      </Head>
      
      <Navbar>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow p-4">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </Navbar>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp; 