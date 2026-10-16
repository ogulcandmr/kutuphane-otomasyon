import { ArrowLeft, BookOpen, Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SupabaseUnitOfWork } from '@/infrastructure/repositories/SupabaseUnitOfWork';
import { CatalogService } from '@/services/CatalogService';
import { EditBookForm } from './EditBookForm';

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const uow = SupabaseUnitOfWork.getInstance();
  const catalogService = new CatalogService(uow);

  const book = await catalogService.getBookById(id);
  if (!book) {
    notFound();
  }

  const categories = await catalogService.getCategories();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
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
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Kitap Bilgilerini Düzenle</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              &quot;{book.title}&quot; başlıklı eserin katalog metaverilerini güncelleyiniz.
            </p>
          </div>
        </div>

        <EditBookForm
          book={{
            id: book.id,
            isbn: book.isbn,
            title: book.title,
            publisher: book.publisher,
            publishYear: book.publishYear,
            pageCount: book.pageCount,
            categoryId: book.categoryId ?? 1,
            description: book.description ?? '',
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
