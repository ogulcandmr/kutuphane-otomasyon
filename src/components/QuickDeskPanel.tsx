'use client';

import {
  AlertCircle,
  ArrowRight,
  BookCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  QrCode,
  UserCheck,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { borrowBookAction, returnBookAction } from '../app/actions';

export function QuickDeskPanel() {
  const [activeTab, setActiveTab] = useState<'BORROW' | 'RETURN'>('BORROW');
  const [isPending, startTransition] = useTransition();

  // Form State
  const [userIdentifier, setUserIdentifier] = useState('2024001'); // Ali Yılmaz (Öğrenci)
  const [barcode, setBarcode] = useState('BC-CS-002'); // Raftaki Clean Code kopyası

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: {
      overdueDays?: number;
      fineAmount?: number;
      newDueDate?: string;
    };
  }>({ type: null, message: '' });

  const handleBorrow = () => {
    if (!userIdentifier.trim() || !barcode.trim()) {
      setFeedback({ type: 'error', message: 'Lütfen üye no ve barkod alanlarını doldurunuz.' });
      return;
    }

    startTransition(async () => {
      const res = await borrowBookAction(userIdentifier.trim(), barcode.trim());
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message,
        });
      }
    });
  };

  const handleReturn = () => {
    if (!barcode.trim()) {
      setFeedback({ type: 'error', message: 'Lütfen iade edilecek kitap barkodunu giriniz.' });
      return;
    }

    startTransition(async () => {
      const res = await returnBookAction(barcode.trim());
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message,
          details: {
            overdueDays: res.overdueDays,
            fineAmount: res.fineAmount,
          },
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message,
        });
      }
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      {/* Sekme Butonları */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-6">
        <button
          onClick={() => {
            setActiveTab('BORROW');
            setFeedback({ type: null, message: '' });
          }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'BORROW'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookCheck className="w-4 h-4" />
          <span>Hızlı Ödünç Ver</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('RETURN');
            setFeedback({ type: null, message: '' });
          }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'RETURN'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Hızlı İade Al</span>
        </button>
      </div>

      {/* Form Alanı */}
      <div className="space-y-4">
        {activeTab === 'BORROW' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Üye No / TC / Öğrenci No
            </label>
            <div className="relative">
              <input
                type="text"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                placeholder="Örn: 2024001 veya AKAD-102"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-10"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {/* Hızlı Test Kısayolları */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setUserIdentifier('2024001')}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Ali (Öğrenci)
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setUserIdentifier('AKAD-102')}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Ayşe (Akademisyen)
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setUserIdentifier('STD-505')}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Mehmet (Standart)
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Kitap Barkodu
          </label>
          <div className="relative">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Örn: BC-2024-001"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-10"
            />
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          {/* Hızlı Barkod Test Kısayolları */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => setBarcode('BC-CS-002')}
              className="text-[11px] text-emerald-400 hover:underline"
            >
              BC-CS-002 (Rafta - Ödünç Ver)
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => setBarcode('BC-CS-001')}
              className="text-[11px] text-rose-400 hover:underline"
            >
              BC-CS-001 (Gecikmeli - İade Al)
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => setBarcode('BC-CS-003')}
              className="text-[11px] text-indigo-400 hover:underline"
            >
              BC-CS-003 (Refactoring)
            </button>
          </div>
        </div>

        {/* Gönder Butonu */}
        <button
          onClick={activeTab === 'BORROW' ? handleBorrow : handleReturn}
          disabled={isPending}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-4 text-white shadow-lg ${
            activeTab === 'BORROW'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>İşlem Yürütülüyor...</span>
            </>
          ) : (
            <>
              <span>{activeTab === 'BORROW' ? 'Kitabı Ödünç Ver' : 'Kitabı İade Al'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Geri Bildirim Mesajı */}
      {feedback.type && (
        <div
          className={`mt-5 p-4 rounded-xl border flex items-start gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium leading-relaxed">{feedback.message}</p>
            {feedback.details && feedback.details.fineAmount !== undefined && feedback.details.fineAmount > 0 && (
              <div className="flex items-center gap-3 mt-2 text-xs bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30">
                <span className="flex items-center gap-1 font-semibold text-rose-300">
                  <Clock className="w-3.5 h-3.5" />
                  Gecikme: {feedback.details.overdueDays} Gün
                </span>
                <span className="flex items-center gap-1 font-semibold text-rose-300">
                  <DollarSign className="w-3.5 h-3.5" />
                  Ceza: {feedback.details.fineAmount.toFixed(2)} TL
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
