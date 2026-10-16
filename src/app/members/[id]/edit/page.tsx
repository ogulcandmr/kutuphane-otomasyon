import { ArrowLeft, Edit, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SupabaseUnitOfWork } from '@/infrastructure/repositories/SupabaseUnitOfWork';
import { MemberService } from '@/services/MemberService';
import { EditMemberForm } from './EditMemberForm';

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const uow = SupabaseUnitOfWork.getInstance();
  const memberService = new MemberService(uow);

  const member = await memberService.getMemberById(id);
  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
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
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Üye Bilgilerini Düzenle</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              &quot;{member.fullName}&quot; ({member.studentOrStaffId}) adlı üyenin rol, kota ve tipini güncelleyiniz.
            </p>
          </div>
        </div>

        <EditMemberForm
          member={{
            id: member.id,
            studentOrStaffId: member.studentOrStaffId,
            fullName: member.fullName,
            email: member.email,
            role: member.role,
            userType: member.userType,
            maxBorrowLimit: member.maxBorrowLimit,
          }}
        />
      </div>
    </div>
  );
}
