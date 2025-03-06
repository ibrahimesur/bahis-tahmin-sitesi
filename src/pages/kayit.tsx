import { NextPage } from 'next';
import Head from 'next/head';
import RegisterForm from '../components/auth/RegisterForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { checkAuth } from '../utils/api';

const RegisterPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if (checkAuth()) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Kayıt Ol | Bahis Tahmin Sitesi</title>
        <meta name="description" content="Bahis tahmin sitesine kayıt olun ve tahminlerinizi paylaşın." />
      </Head>

      <div className="container mx-auto px-4 py-12">
        <RegisterForm />
      </div>
    </>
  );
};

export default RegisterPage; 