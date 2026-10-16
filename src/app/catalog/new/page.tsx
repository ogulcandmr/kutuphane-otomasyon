'use client';

import { ArrowLeft, BookPlus, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createBookAction } from '@/app/actions';

export default function NewBookPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    publisher: '',
    publishYear: new Date().getFullYear(),
    pageCount: 350,
    description: '',
    initialCopiesCount: 2,
    categoryId: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isbn || !formData.title || !formData.publisher) {
      setFeedback({ type: 'error', message: 'Lütfen zorunlu alanları doldurunuz.' });
      return;
    }

    startTransition(async () => {
      const res = await createBookAction({
        ...formData,
        publishYear: Number(formData.publishYear),
        pageCount: Number(formData.pageCount),
        initialCopiesCount: Number(formData.initialCopiesCount),
        categoryId: Number(formData.categoryId),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          router.push('/catalog');
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/catalog"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kataloğa Geri Dön</span>
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Yeni Kitap ve Kopya Kaydı</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Envantere yeni bir eser ve fiziksel kopyalarını ekleyiniz.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ISBN Numarası *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 978-0132350884"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>Yazılım & Bilgisayar (CS)</option>
                <option value={2}>Dünya Edebiyatı (LIT)</option>
                <option value={3}>Felsefe & Mantık (PHI)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kitap Başlığı (Adı) *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: The Pragmatic Programmer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Yayınevi *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Addison-Wesley"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Basım Yılı
              </label>
              <input
                type="number"
                value={formData.publishYear}
                onChange={(e) => setFormData({ ...formData, publishYear: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sayfa Sayısı
              </label>
              <input
                type="number"
                value={formData.pageCount}
                onChange={(e) => setFormData({ ...formData, pageCount: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Açıklama / Özet
            </label>
            <textarea
              rows={3}
              placeholder="Kitap hakkında kısa açıklama..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="block text-xs font-semibold text-indigo-400 mb-1">
              Oluşturulacak Fiziksel Kopya Sayısı (Book Copies)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Her kopya için otomatik benzersiz barkod üretilerek State Pattern (AVAILABLE) durumunda raftaki yerini alır.
            </p>
            <input
              type="number"
              min={1}
              max={10}
              value={formData.initialCopiesCount}
              onChange={(e) => setFormData({ ...formData, initialCopiesCount: Number(e.target.value) })}
              className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
            />
          </div>

          {feedback.message && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/catalog"
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Kitabı Envantere Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
