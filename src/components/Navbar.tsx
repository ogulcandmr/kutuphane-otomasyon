'use client';

import { Bell, Database, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = 'Kütüphane Yönetim Paneli' }: NavbarProps) {
  return (
    <header className="h-16 border-b border-slate-800 glass-panel px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Supabase / Veri Tabanı Durum Rozeti */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Database className="w-3.5 h-3.5" />
          <span>Veri Katmanı: Aktif (RDBMS)</span>
        </div>

        {/* Yetki Rozeti */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Librarian Desk</span>
        </div>

        {/* Profil */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-slate-200">Zeynep K.</p>
            <p className="text-[10px] text-slate-400">Baş Kütüphaneci</p>
          </div>
        </div>
      </div>
    </header>
  );
}
