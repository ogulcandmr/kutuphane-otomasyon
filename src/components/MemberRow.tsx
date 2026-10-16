'use client';

import { Edit, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { deleteMemberAction } from '@/app/actions';
import { UserRole, UserType } from '@/core/types/enums';

interface MemberRowProps {
  user: {
    id: string;
    studentOrStaffId: string;
    fullName: string;
    email: string;
    role: UserRole;
    userType: UserType;
    maxBorrowLimit: number;
    createdAt: string;
  };
}

export function MemberRow({ user }: MemberRowProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getUserTypeBadge = (type: UserType) => {
    switch (type) {
      case UserType.STUDENT:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            ÖĞRENCİ (5 TL/gün)
          </span>
        );
      case UserType.ACADEMIC:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            AKADEMİSYEN (2 TL/gün)
          </span>
        );
      case UserType.STANDARD:
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            STANDART (10 TL/gün)
          </span>
        );
    }
  };

  const handleDelete = () => {
    if (!confirm(`"${user.fullName}" (${user.studentOrStaffId}) adlı üyeyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);
      const res = await deleteMemberAction(user.id);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <>
      <tr className="hover:bg-slate-900/40 transition-colors">
        <td className="py-3.5 px-5">
          <div className="font-bold text-slate-100">{user.fullName}</div>
          <div className="text-[11px] text-slate-400">{user.email}</div>
        </td>
        <td className="py-3.5 px-5">
          <code className="text-xs font-mono font-semibold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {user.studentOrStaffId}
          </code>
        </td>
        <td className="py-3.5 px-5">{getUserTypeBadge(user.userType)}</td>
        <td className="py-3.5 px-5">
          <span className="text-[11px] font-medium text-slate-300">{user.role}</span>
        </td>
        <td className="py-3.5 px-5">
          <span className="font-bold text-indigo-400">{user.maxBorrowLimit} Kitap</span>
        </td>
        <td className="py-3.5 px-5 text-slate-400">
          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
        </td>
        <td className="py-3.5 px-5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <Link
              href={`/members/${user.id}/edit`}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Üye Bilgilerini Düzenle"
            >
              <Edit className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
              title="Üyeyi Sil"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </td>
      </tr>
      {errorMessage && (
        <tr>
          <td colSpan={7} className="px-5 py-2 bg-rose-500/10 border-y border-rose-500/20">
            <div className="flex items-center justify-between text-xs text-rose-300 font-medium">
              <span>⚠️ {errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-[10px] underline ml-2"
              >
                Kapat
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
