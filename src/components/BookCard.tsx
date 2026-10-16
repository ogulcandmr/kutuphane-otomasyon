'use client';

import {
  AlertTriangle,
  BookmarkPlus,
  Edit,
  Loader2,
  Plus,
  Settings,
  Trash2,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  addCopyAction,
  createReservationAction,
  deleteBookAction,
  deleteCopyAction,
  toggleCopyMaintenanceAction,
} from '@/app/actions';
import { CopyStatus } from '@/core/types/enums';

interface CopyItem {
  id: string;
  barcode: string;
  shelfLocation: string;
  status: CopyStatus;
  conditionNotes?: string;
}

interface BookCardProps {
  book: {
    id: string;
    isbn: string;
    title: string;
    publisher: string;
    publishYear: number;
    pageCount: number;
    categoryName?: string;
    authorsString: string;
    description?: string;
    availableCopyCount: number;
    totalCopyCount: number;
    copies: CopyItem[];
  };
}

export function BookCard({ book }: BookCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddCopy, setShowAddCopy] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [reserveUserId, setReserveUserId] = useState('2024002'); // Burak Kaya (Öğrenci)
  const [newBarcode, setNewBarcode] = useState(`BC-${Date.now().toString().slice(-4)}`);
  const [newShelf, setNewShelf] = useState('CS-01');
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const getStatusBadge = (status: CopyStatus) => {
    switch (status) {
      case CopyStatus.AVAILABLE:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Rafta (AVAILABLE)
          </span>
        );
      case CopyStatus.BORROWED:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Ödünçte (BORROWED)
          </span>
        );
      case CopyStatus.RESERVED:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Rezerve (RESERVED)
          </span>
        );
      case CopyStatus.MAINTENANCE:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Bakımda (MAINTENANCE)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const handleDeleteBook = () => {
    if (!confirm(`"${book.title}" başlıklı kitabı ve kopyalarını silmek istediğinize emin misiniz?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteBookAction(book.id);
      if (!res.success) {
        setMessage({ text: res.message, error: true });
      }
    });
  };

  const handleAddCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarcode.trim() || !newShelf.trim()) return;

    startTransition(async () => {
      const res = await addCopyAction(book.id, newBarcode.trim(), newShelf.trim());
      if (res.success) {
        setShowAddCopy(false);
        setNewBarcode(`BC-${Date.now().toString().slice(-4)}`);
        setMessage({ text: res.message });
      } else {
        setMessage({ text: res.message, error: true });
      }
    });
  };

  const handleDeleteCopy = (copyId: string, barcode: string) => {
    if (!confirm(`${barcode} barkodlu kopyayı silmek istediğinize emin misiniz?`)) return;

    startTransition(async () => {
      const res = await deleteCopyAction(copyId);
      if (!res.success) {
        setMessage({ text: res.message, error: true });
      }
    });
  };

  const handleToggleMaintenance = (barcode: string, currentStatus: CopyStatus) => {
    startTransition(async () => {
      const res = await toggleCopyMaintenanceAction(barcode, currentStatus);
      if (!res.success) {
        setMessage({ text: res.message, error: true });
      }
    });
  };

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveUserId.trim()) return;

    startTransition(async () => {
      const res = await createReservationAction(book.id, reserveUserId.trim());
      setShowReserve(false);
      setMessage({ text: res.message, error: !res.success });
    });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4">
      {/* Üst Bilgi & Eylem Butonları */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              ISBN: {book.isbn}
            </span>
            {book.categoryName && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                {book.categoryName}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-100">{book.title}</h2>
          <p className="text-xs text-slate-400">
            Yazar(lar): <span className="text-slate-300 font-medium">{book.authorsString}</span> •{' '}
            {book.publisher} ({book.publishYear}) • {book.pageCount} Sayfa
          </p>
          {book.description && (
            <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {book.description}
            </p>
          )}
        </div>

        {/* Aksiyonlar: Rezerve Et, Düzenle & Sil */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right mr-3 hidden sm:block">
            <span className="text-xs text-slate-400 block">Kopya Durumu</span>
            <span className="text-sm font-bold text-emerald-400">
              {book.availableCopyCount} Rafta / {book.totalCopyCount} Toplam
            </span>
          </div>

          <button
            onClick={() => setShowReserve(!showReserve)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all"
            title="Sıraya Gir / Rezerve Et (Observer Pattern)"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rezerve Et</span>
          </button>

          <Link
            href={`/catalog/${book.id}/edit`}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Kitap Bilgilerini Düzenle"
          >
            <Edit className="w-4 h-4" />
          </Link>

          <button
            onClick={handleDeleteBook}
            disabled={isPending}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
            title="Kitabı Envanterden Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rezervasyon Açılır Formu */}
      {showReserve && (
        <form
          onSubmit={handleReserve}
          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center gap-3 text-xs"
        >
          <div className="text-amber-300 font-semibold flex items-center gap-1.5">
            <BookmarkPlus className="w-4 h-4" />
            <span>Rezervasyon Kuyruğu:</span>
          </div>
          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="Üye No / Sicil (Örn: 2024002)"
              value={reserveUserId}
              onChange={(e) => setReserveUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-3.5 py-1.5 rounded-lg font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
          >
            Sıraya Al
          </button>
          <button
            type="button"
            onClick={() => setShowReserve(false)}
            className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
          >
            Vazgeç
          </button>
        </form>
      )}

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            message.error
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-[10px] underline hover:no-underline ml-2"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Fiziksel Kopyalar Başlığı & Kopya Ekle Butonu */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
            Fiziksel Envanter Kopyaları ({book.copies.length} Adet)
          </span>
          <button
            onClick={() => setShowAddCopy(!showAddCopy)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kopya Ekle</span>
          </button>
        </div>

        {/* Yeni Kopya Ekleme Formu */}
        {showAddCopy && (
          <form
            onSubmit={handleAddCopy}
            className="p-3 mb-4 rounded-xl bg-slate-900 border border-slate-700 flex flex-wrap items-center gap-3 text-xs"
          >
            <div className="flex-1 min-w-[140px]">
              <input
                type="text"
                placeholder="Barkod (Örn: BC-CS-099)"
                value={newBarcode}
                onChange={(e) => setNewBarcode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
              />
            </div>
            <div className="w-28">
              <input
                type="text"
                placeholder="Raf Konumu"
                value={newShelf}
                onChange={(e) => setNewShelf(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setShowAddCopy(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              İptal
            </button>
          </form>
        )}

        {/* Kopya Kartları Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {book.copies.map((copy) => (
            <div
              key={copy.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono font-bold text-slate-200">
                  {copy.barcode}
                </code>
                {getStatusBadge(copy.status)}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  Raf: <strong className="text-slate-300">{copy.shelfLocation}</strong>
                </span>
                {copy.conditionNotes && (
                  <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                    {copy.conditionNotes}
                  </span>
                )}
              </div>

              {/* Kopya Alt Aksiyonları: Bakım Durumu & Kopya Sil */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                {copy.status !== CopyStatus.BORROWED && (
                  <button
                    onClick={() => handleToggleMaintenance(copy.barcode, copy.status)}
                    disabled={isPending}
                    className={`flex items-center gap-1 font-medium transition-colors ${
                      copy.status === CopyStatus.MAINTENANCE
                        ? 'text-emerald-400 hover:underline'
                        : 'text-amber-400 hover:underline'
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span>
                      {copy.status === CopyStatus.MAINTENANCE ? 'Tamiri Bitir' : 'Bakıma Al'}
                    </span>
                  </button>
                )}

                {copy.status !== CopyStatus.BORROWED && (
                  <button
                    onClick={() => handleDeleteCopy(copy.id, copy.barcode)}
                    disabled={isPending}
                    className="text-rose-400 hover:underline ml-auto flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Sil</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
