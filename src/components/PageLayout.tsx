import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  title?: string;
  content?: string;
  children?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, content, children }) => {
  return (
    <div data-sb-object-id="page">
      <Head>
        <title>{title || 'Bahis Tahmin Sitesi'}</title>
        <meta name="description" content="Profesyonel bahis tahminleri ve analizleri" />
      </Head>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {title && <h1 data-sb-field-path="title" className="text-3xl font-bold mb-6">{title}</h1>}
        {content && (
          <div 
            data-sb-field-path="content" 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout; 