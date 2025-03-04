import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        {/* Preconnect to third-party domains */}
        <link rel="preconnect" href="https://crests.football-data.org" />
        <link rel="dns-prefetch" href="https://crests.football-data.org" />
        <link rel="preconnect" href="https://media.api-sports.io" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link rel="preconnect" href="https://media-1.api-sports.io" />
        <link rel="preconnect" href="https://media-2.api-sports.io" />
        <link rel="preconnect" href="https://media-3.api-sports.io" />
        <link rel="preconnect" href="https://media-4.api-sports.io" />
        
        {/* Font optimization */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 