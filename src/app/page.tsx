import {
  AlertTriangle,
  BookMarked,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  History,
  Layers,
  Repeat,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { QuickDeskPanel } from '@/components/QuickDeskPanel';
import { StatCard } from '@/components/StatCard';
import { StrategySimulator } from '@/components/StrategySimulator';
import { getDashboardDataAction } from './actions';

export default async function DashboardPage() {
  const stats = await getDashboardDataAction();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Üst Karşılama ve Hızlı Başlık */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Yazılım Tasarımı & Mimarisi
            </span>
            <span className="text-xs text-slate-400">Ders Projesi v1.0</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Kütüphane Sirkülasyon ve Yönetim Masası
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Nesne Yönelimli Analiz ve Tasarım (OOAD) standartlarına uygun katmanlı otomasyon paneli.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/circulation"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Sirkülasyon Masası</span>
          </Link>
          <Link
            href="/architecture"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>UML & Mimari</span>
          </Link>
        </div>
      </div>

      {/* İstatistik Metrik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Toplam Başlık"
          value={stats.totalBooks}
          subtitle={`${stats.totalCopies} Fiziksel Kopya`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Raftaki Kopyalar"
          value={stats.availableCopies}
          subtitle="Ödünç Verilebilir"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Aktif Ödünç"
          value={stats.activeLoans}
          subtitle="Okuyucularda"
          icon={BookMarked}
          color="violet"
        />
        <StatCard
          title="Geciken İadeler"
          value={stats.overdueLoans}
          subtitle="Ceza Sürecinde"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Tahakkuk Eden Ceza"
          value={`${stats.unpaidFinesTotal.toFixed(2)} ₺`}
          subtitle="Ödenmemiş Toplam"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Ana Çalışma Alanı: Hızlı İşlem Masası & Dinamik Simülatör */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon: Hızlı Masası */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-400" />
              <span>Hızlı İşlem Tezgahı</span>
            </h2>
            <span className="text-xs text-slate-400">Barkod Okuyucu / Klavye Girişi</span>
          </div>
          <QuickDeskPanel />
        </div>

        {/* Sağ Kolon: Strategy Simulator & Son Denetim Kayıtları */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Tasarım Deseni Simülasyonu</span>
            </h2>
            <StrategySimulator />
          </div>

          {/* Son Hareketler / Audit Logs */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Son Sistem Hareketleri</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Audit Logs
              </span>
            </div>

            <div className="space-y-3">
              {stats.recentAuditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Henüz bir hareket kaydedilmedi. Hızlı masadan ödünç veya iade işlemi yapabilirsiniz.
                </p>
              ) : (
                stats.recentAuditLogs.map((log, idx) => (
                  <div
                    key={log.id ?? idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-slate-800 text-indigo-300">
                          {log.action}
                        </span>
                        <span className="text-slate-300 font-medium">{log.entityName}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 font-mono">
                        {log.details ? JSON.stringify(log.details) : `ID: ${log.entityId}`}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
