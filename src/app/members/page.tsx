import { Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { MemberRow } from '@/components/MemberRow';
import { SupabaseUnitOfWork } from '@/infrastructure/repositories/SupabaseUnitOfWork';
import { MemberService } from '@/services/MemberService';

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const uow = SupabaseUnitOfWork.getInstance();
  const memberService = new MemberService(uow);

  const members = await memberService.getMembers(q);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Üye Yönetimi ve Yetkilendirme</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Polymorphic User hiyerarşisi, anlık bilgi güncelleme, kota yönetimi ve güvenli silme masası.
          </p>
        </div>

        <Link
          href="/members/new"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Üye Kaydet</span>
        </Link>
      </div>

      {/* Arama */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <form method="GET" className="relative w-full sm:w-80">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="İsim, sicil veya e-posta ile ara..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 pl-9"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Üye Tablosu */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Üye Bilgisi</th>
                <th className="py-3.5 px-5">Sicil / Öğrenci No</th>
                <th className="py-3.5 px-5">Üyelik Tipi (Polymorphism)</th>
                <th className="py-3.5 px-5">Rol</th>
                <th className="py-3.5 px-5">Ödünç Limiti (Kota)</th>
                <th className="py-3.5 px-5">Kayıt Tarihi</th>
                <th className="py-3.5 px-5 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Kayıtlı üye bulunamadı.
                  </td>
                </tr>
              ) : (
                members.map((user) => (
                  <MemberRow
                    key={user.id}
                    user={{
                      id: user.id,
                      studentOrStaffId: user.studentOrStaffId,
                      fullName: user.fullName,
                      email: user.email,
                      role: user.role,
                      userType: user.userType,
                      maxBorrowLimit: user.maxBorrowLimit,
                      createdAt: user.createdAt.toISOString(),
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
