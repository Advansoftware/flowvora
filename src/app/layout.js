import { ThemeProvider } from '../providers/ThemeProvider';
import "./globals.css";

export const metadata = {
  title: "LofiVora - Your Personal Lo-fi Focus Space",
  description: "Uma aplicação web responsiva que simula uma rádio Lo-fi para foco e produtividade. Sinta-se calmo e imerso com nossa seleção de ambientes relaxantes.",
  keywords: ["lo-fi", "foco", "produtividade", "música", "concentração", "relaxamento"],
  authors: [{ name: "LofiVora Team" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-512.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "LofiVora - Your Personal Lo-fi Focus Space",
    description: "Ambiente relaxante para foco e produtividade com música lo-fi",
    type: "website",
    images: [
      {
        url: "/icon-512.svg",
        width: 512,
        height: 512,
        alt: "LofiVora Logo",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
