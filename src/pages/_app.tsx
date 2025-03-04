import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>BankoLab - Bahis Tahmin Sitesi</title>
        <meta name="description" content="Futbol bahis tahminleri, canlı skorlar ve puan durumları" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar>
        <main className="p-4">
          <Component {...pageProps} />
        </main>
        <Footer />
      </Navbar>
    </AuthProvider>
  );
}

export default MyApp; 