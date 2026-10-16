'use client';

import { ArrowLeft, CheckCircle, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createMemberAction } from '@/app/actions';
import { UserRole, UserType } from '@/core/types/enums';

export default function NewMemberPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const [formData, setFormData] = useState({
    studentOrStaffId: '',
    fullName: '',
    email: '',
    role: UserRole.MEMBER,
    userType: UserType.STUDENT,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentOrStaffId || !formData.fullName || !formData.email) {
      setFeedback({ type: 'error', message: 'Lütfen tüm alanları doldurunuz.' });
      return;
    }

    startTransition(async () => {
      const res = await createMemberAction(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          router.push('/members');
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Üye Listesine Geri Dön</span>
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Yeni Üye Kaydı</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Polymorphic User nesnesi ve Strategy katsayıları otomatik atanır.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Öğrenci No / Personel Sicil No *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: 2024099 veya AKAD-204"
              value={formData.studentOrStaffId}
              onChange={(e) => setFormData({ ...formData, studentOrStaffId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ad Soyad *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Canan Yıldız"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-posta Adresi *
            </label>
            <input
              type="email"
              required
              placeholder="Örn: canan.yildiz@universite.edu.tr"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Üyelik Tipi (Ceza ve Kota Belirler) *
              </label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as UserType })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={UserType.STUDENT}>Öğrenci (3 Kitap Limiti - 5 TL/gün)</option>
                <option value={UserType.ACADEMIC}>Akademisyen (7 Kitap Limiti - 2 TL/gün)</option>
                <option value={UserType.STANDARD}>Standart Üye (2 Kitap Limiti - 10 TL/gün)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sistem Rolü
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={UserRole.MEMBER}>MEMBER (Standart Üye)</option>
                <option value={UserRole.LIBRARIAN}>LIBRARIAN (Kütüphaneci)</option>
                <option value={UserRole.ADMIN}>ADMIN (Yönetici)</option>
              </select>
            </div>
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
              href="/members"
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
              <span>Üyeyi Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
