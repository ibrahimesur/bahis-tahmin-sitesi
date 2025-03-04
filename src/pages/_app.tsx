import { AuthProvider } from '../contexts/AuthContext';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Head from 'next/head';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <AuthProvider>
      <SessionProvider session={session}>
        <div className="flex flex-col min-h-screen">
          <Head>
            <title>Bahis Tahmin Sitesi</title>
            <meta name="description" content="Profesyonel bahis tahminleri ve analizleri" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          
          <Navbar />
          
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          
          <Footer />
        </div>
      </SessionProvider>
    </AuthProvider>
  );
}

export default MyApp; 