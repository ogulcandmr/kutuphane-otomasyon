import { BookOpen, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { BookCard } from '@/components/BookCard';
import { SupabaseUnitOfWork } from '@/infrastructure/repositories/SupabaseUnitOfWork';
import { CatalogService } from '@/services/CatalogService';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const uow = SupabaseUnitOfWork.getInstance();
  const catalogService = new CatalogService(uow);

  const categoryId = cat ? Number(cat) : undefined;
  const books = await catalogService.getBooks(q, categoryId);
  const categories = await catalogService.getCategories();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Kitap Kataloğu ve Fiziksel Envanter</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Eser yönetimi, State Pattern kopyaları, anlık düzenleme ve güvenli silme masası.
          </p>
        </div>

        <Link
          href="/catalog/new"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kitap Ekle</span>
        </Link>
      </div>

      {/* Arama & Kategori Filtreleri */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <form method="GET" className="relative w-full sm:w-80">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Kitap başlığı, ISBN veya yazar ara..."
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 pl-9"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          {cat && <input type="hidden" name="cat" value={cat} />}
        </form>

        {/* Kategori Etiketleri */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Link
            href="/catalog"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tümü
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?cat=${c.id}${q ? `&q=${q}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                cat === String(c.id)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Kitap Kartları Listesi */}
      <div className="grid grid-cols-1 gap-6">
        {books.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-800">
            Aramanıza uygun kitap bulunamadı.
          </div>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={{
                id: book.id,
                isbn: book.isbn,
                title: book.title,
                publisher: book.publisher,
                publishYear: book.publishYear,
                pageCount: book.pageCount,
                categoryName: book.categoryName,
                authorsString: book.getAuthorsString(),
                description: book.description,
                availableCopyCount: book.getAvailableCopyCount(),
                totalCopyCount: book.getTotalCopyCount(),
                copies: book.copies.map((c) => ({
                  id: c.id,
                  barcode: c.barcode,
                  shelfLocation: c.shelfLocation,
                  status: c.status,
                  conditionNotes: c.conditionNotes,
                })),
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
