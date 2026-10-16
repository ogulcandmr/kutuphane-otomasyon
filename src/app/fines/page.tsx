'use client';

import {
  AlertCircle,
  Banknote,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { StrategySimulator } from '@/components/StrategySimulator';
import { payFineAction } from '../actions';

interface FineDetailItem {
  id: string;
  userName: string;
  userType: string;
  studentOrStaffId: string;
  amount: number;
  isPaid: boolean;
  calculatedAt: string;
  paidAt?: string | null;
}

export default function FinesPage() {
  const [fines, setFines] = useState<FineDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const loadFines = async () => {
    setIsLoading(true);
    // API veya direct action
    const res = await fetch('/api/fines');
    if (res.ok) {
      const data = await res.json();
      setFines(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFines();
  }, []);

  const handlePay = (fineId: string) => {
    startTransition(async () => {
      const res = await payFineAction(fineId);
      setMessage({ text: res.message, success: res.success });
      if (res.success) {
        await loadFines();
      }
    });
  };

  const totalUnpaid = fines
    .filter((f) => !f.isPaid)
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" />
            <span>Gecikme Cezaları ve Tahsilat Yönetimi</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Strategy Pattern (IFineCalculationStrategy) ile işletilen dinamik gecikme katsayıları ve tahsilat.
          </p>
        </div>

        <button
          onClick={loadFines}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            message.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.success ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Sol Tablo, Sağ Simülatör */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Tahakkuk Eden Ceza Kayıtları</span>
            </h2>
            <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-bold">
              Bekleyen Borç: {totalUnpaid.toFixed(2)} TL
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
                <p className="text-xs">Cezalar yükleniyor...</p>
              </div>
            ) : fines.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Sistemde bekleyen veya tahsil edilmiş bir gecikme cezası bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Üye Bilgisi</th>
                      <th className="py-3 px-4">Tutar</th>
                      <th className="py-3 px-4">Tarih</th>
                      <th className="py-3 px-4">Durum</th>
                      <th className="py-3 px-4 text-right">Eylem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {fines.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{f.userName}</div>
                          <div className="text-[11px] text-slate-400">
                            {f.studentOrStaffId} • <span className="text-indigo-400">{f.userType}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-100">
                          {f.amount.toFixed(2)} TL
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(f.calculatedAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          {f.isPaid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              Ödendi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 w-fit">
                              Ödenmedi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!f.isPaid && (
                            <button
                              onClick={() => handlePay(f.id)}
                              disabled={isPending}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                            >
                              Tahsil Et (Öde)
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

        {/* Sağ Kolon: Strategy Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-400" />
            <span>Strateji Katsayı Hesaplayıcı</span>
          </h2>
          <StrategySimulator />
        </div>
      </div>
    </div>
  );
}
