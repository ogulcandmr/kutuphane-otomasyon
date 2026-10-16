'use client';

import {
  BookOpen,
  DollarSign,
  Layers,
  LayoutDashboard,
  Repeat,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Genel Bakış', href: '/', icon: LayoutDashboard },
  { name: 'Sirkülasyon Masası', href: '/circulation', icon: Repeat },
  { name: 'Kitap Kataloğu', href: '/catalog', icon: BookOpen },
  { name: 'Üye Yönetimi', href: '/members', icon: Users },
  { name: 'Gecikme Cezaları', href: '/fines', icon: DollarSign },
  { name: 'Mimari & UML Vitrini', href: '/architecture', icon: Layers },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Logo & Başlık */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm tracking-wide">KÜTÜPHANE</h1>
              <p className="text-xs text-indigo-400 font-medium">Otomasyon & Mimari</p>
            </div>
          </div>
        </div>

        {/* Menü Linkleri */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Alt Bilgi & Mimari Rozet */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>N-Tier Architecture</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            State, Strategy & Observer desenleri aktif.
          </p>
        </div>
      </div>
    </aside>
  );
}
