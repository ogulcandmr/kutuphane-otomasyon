'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { updateMemberAction } from '@/app/actions';
import { UserRole, UserType } from '@/core/types/enums';

interface EditMemberFormProps {
  member: {
    id: string;
    studentOrStaffId: string;
    fullName: string;
    email: string;
    role: UserRole;
    userType: UserType;
    maxBorrowLimit: number;
  };
}

export function EditMemberForm({ member }: EditMemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const [formData, setFormData] = useState({
    studentOrStaffId: member.studentOrStaffId,
    fullName: member.fullName,
    email: member.email,
    role: member.role,
    userType: member.userType,
    maxBorrowLimit: member.maxBorrowLimit,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateMemberAction(member.id, {
        ...formData,
        maxBorrowLimit: Number(formData.maxBorrowLimit),
      });

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          router.push('/members');
          router.refresh();
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Öğrenci No / Personel Sicil No *
        </label>
        <input
          type="text"
          required
          value={formData.studentOrStaffId}
          onChange={(e) => setFormData({ ...formData, studentOrStaffId: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Ad Soyad *</label>
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">E-posta Adresi *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Üyelik Tipi *
          </label>
          <select
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value as UserType })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value={UserType.STUDENT}>Öğrenci (5 TL/gün)</option>
            <option value={UserType.ACADEMIC}>Akademisyen (2 TL/gün)</option>
            <option value={UserType.STANDARD}>Standart (10 TL/gün)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Sistem Rolü</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value={UserRole.MEMBER}>MEMBER</option>
            <option value={UserRole.LIBRARIAN}>LIBRARIAN</option>
            <option value={UserRole.ADMIN}>ADMIN</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Ödünç Limiti (Kota)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={formData.maxBorrowLimit}
            onChange={(e) => setFormData({ ...formData, maxBorrowLimit: Number(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
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
          <span>Değişiklikleri Kaydet</span>
        </button>
      </div>
    </form>
  );
}
