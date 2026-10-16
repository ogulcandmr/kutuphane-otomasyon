'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Repeat,
  Search,
  User,
} from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { QuickDeskPanel } from '@/components/QuickDeskPanel';
import { extendLoanAction, getCirculationDataAction } from '../actions';

interface LoanItem {
  id: string;
  userName: string;
  userType: string;
  studentOrStaffId: string;
  barcode: string;
  bookTitle: string;
  loanDate: string;
  dueDate: string;
  isOverdue: boolean;
  overdueDays: number;
  status: string;
}

export default function CirculationPage() {
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ text: string; success: boolean } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getCirculationDataAction();
    setLoans(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExtend = (loanId: string) => {
    startTransition(async () => {
      const res = await extendLoanAction(loanId);
      setActionMessage({ text: res.message, success: res.success });
      if (res.success) {
        await loadData();
      }
    });
  };

  const filteredLoans = loans.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.studentOrStaffId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-indigo-400" />
            <span>Sirkülasyon Masası (Ödünç & İade)</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fiziksel kitap teslimi, iade kabulü, ceza işletimi ve süre uzatma işlemleri.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Hızlı İşlem Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
          <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Hızlı İşlem Girişi</span>
          </h2>
          <QuickDeskPanel />
        </div>

        <div className="lg:col-span-6 flex flex-col justify-between glass-panel p-6 rounded-2xl border border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-2">Sirkülasyon Kuralları & Dinamik Akış</h2>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-indigo-400">1. Ödünç Alma Kontrolü:</span>
                <p className="text-slate-400 mt-0.5">
                  Ödenmemiş ceza ve üyenin ödünç limiti (Öğrenci: 3, Akademisyen: 7, Standart: 2) kontrol edilir.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-emerald-400">2. İade & Observer Bildirimi:</span>
                <p className="text-slate-400 mt-0.5">
                  Kitap teslim alındığında gecikme cezası hesaplanır ve sırada bekleyen rezervasyon varsa kopya otomatik olarak rezerve edilir.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-amber-400">3. Süre Uzatma:</span>
                <p className="text-slate-400 mt-0.5">
                  Gecikmesi olmayan ve sırada bekleyen başka bir üye rezervasyonu bulunmayan ödünçler +7 gün uzatılabilir.
                </p>
              </div>
            </div>
          </div>

          {actionMessage && (
            <div
              className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                actionMessage.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {actionMessage.success ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Aktif ve Geçmiş Ödünç Kayıtları Tablosu */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Tüm Sirkülasyon Kayıtları</h2>
            <p className="text-xs text-slate-400">Kütüphanedeki ödünç alınan ve iade edilen kitaplar</p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Üye, barkod veya kitap adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 pl-9"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <p className="text-xs">Kayıtlar yükleniyor...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Aramanıza uygun ödünç kaydı bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Üye Bilgisi</th>
                  <th className="py-3 px-4">Kitap & Barkod</th>
                  <th className="py-3 px-4">Ödünç Tarihi</th>
                  <th className="py-3 px-4">Son Teslim</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLoans.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{item.userName}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.studentOrStaffId} • <span className="text-indigo-400">{item.userType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{item.bookTitle}</div>
                      <code className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                        {item.barcode}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.loanDate}</td>
                    <td className="py-3 px-4">
                      <span className={item.isOverdue && item.status !== 'RETURNED' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {item.dueDate}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'RETURNED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                          İade Edildi
                        </span>
                      ) : item.isOverdue ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {item.overdueDays} Gün Gecikti
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Aktif (Zamanında)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status !== 'RETURNED' && !item.isOverdue && (
                        <button
                          onClick={() => handleExtend(item.id)}
                          disabled={isPending}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-all"
                        >
                          +7 Gün Uzat
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
