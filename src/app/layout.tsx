import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kütüphane Otomasyon Sistemi | Yazılım Mimarisi',
  description: 'N-Tier Mimari, State, Strategy ve Observer Desenleri Destekli Kütüphane Yönetim ve Sirkülasyon Sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark h-full">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden`}>
        {/* Sol Menü */}
        <Sidebar />

        {/* Ana İçerik Alanı */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
