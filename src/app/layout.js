import { Roboto } from 'next/font/google';
import { ThemeProvider } from '../providers/ThemeProvider';
import { TaskProvider } from '../contexts/TaskContext';
import './globals.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata = {
  title: 'LofiVora',
  description: 'Ambiente focado para produtividade com música lo-fi, chuva e técnica Pomodoro',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon-512.svg',
  },
  keywords: ['pomodoro', 'produtividade', 'foco', 'lofi', 'chuva', 'música'],
  authors: [{ name: 'LofiVora' }],
  creator: 'LofiVora',
  publisher: 'LofiVora',
  robots: 'index, follow',
  // Cache busting para PWA
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
    'pragma': 'no-cache',
    'expires': '0'
  },
  openGraph: {
    title: 'LofiVora - Foco e Produtividade',
    description: 'Ambiente focado para produtividade com música lo-fi, chuva e técnica Pomodoro',
    url: 'https://lofivora.space',
    siteName: 'LofiVora',
    images: [
      {
        url: '/icon-512.svg',
        width: 512,
        height: 512,
        alt: 'LofiVora',
      },
    ],
    locale: 'pt-BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LofiVora - Foco e Produtividade',
    description: 'Ambiente focado para produtividade com música lo-fi, chuva e técnica Pomodoro',
    images: ['/icon-512.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LofiVora',
  },
  applicationName: 'LofiVora',
  category: 'productivity',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Metatag de verificação do Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-9942287479317473" />
        
        {/* Script do Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9942287479317473"
          crossOrigin="anonymous"
        ></script>
        
        {/* Meta tags para PWA imersivo no mobile */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LofiVora" />
        <meta name="theme-color" content="#0f0f23" />
        <meta name="msapplication-navbutton-color" content="#0f0f23" />
        <meta name="msapplication-TileColor" content="#0f0f23" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        
        {/* Cache control para PWA */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon-512.svg" />
        
        {/* Fontes */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
            <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <TaskProvider>
            {children}
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
