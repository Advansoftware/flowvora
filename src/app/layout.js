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
  keywords: ['pomodoro', 'produtividade', 'foco', 'lofi', 'chuva', 'música'],
  authors: [{ name: 'LofiVora' }],
  creator: 'LofiVora',
  publisher: 'LofiVora',
  robots: 'index, follow',
  openGraph: {
    title: 'LofiVora - Foco e Produtividade',
    description: 'Ambiente focado para produtividade com música lo-fi, chuva e técnica Pomodoro',
    url: 'https://lofivora.vercel.app',
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
        {/* Meta tags para PWA imersivo no mobile */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LofiVora" />
        <meta name="theme-color" content="#0f0f23" />
        <meta name="msapplication-navbutton-color" content="#0f0f23" />
        <meta name="msapplication-TileColor" content="#0f0f23" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        
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
