import React from 'react';
import Head from 'next/head';

interface PageLayoutProps {
  title?: string;
  content?: string;
  children?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, content, children }) => {
  return (
    <div data-sb-object-id="page" className="container mx-auto px-4 py-8">
      {title && (
        <Head>
          <title>{title || 'Bahis Tahmin Sitesi'}</title>
          <meta name="description" content="Profesyonel bahis tahminleri ve analizleri" />
        </Head>
      )}
      
      {title && <h1 data-sb-field-path="title" className="text-3xl font-bold mb-6">{title}</h1>}
      
      {content && (
        <div 
          data-sb-field-path="content" 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      
      {children}
    </div>
  );
};

export default PageLayout; 