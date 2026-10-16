import { Book, IAuthor, ICategory } from '../../core/entities/Book';
import { BookCopy } from '../../core/entities/BookCopy';
import { IBookRepository } from '../../core/interfaces/IRepositories';
import { CopyStatus } from '../../core/types/enums';
import { getSupabaseClient, isSupabaseConfigured } from '../db/supabaseClient';
import { SEED_DATA } from '../db/seedData';

interface DbBookAuthorRow {
  author_id: number;
  authors: {
    id: number;
    full_name: string;
    biography: string | null;
  } | null;
}

interface DbCopyRow {
  id: string;
  book_id: string;
  barcode: string;
  shelf_location: string;
  status: CopyStatus;
  condition_notes: string | null;
  created_at: string;
}

interface DbBookRow {
  id: string;
  isbn: string;
  title: string;
  category_id: number | null;
  publisher: string;
  publish_year: number;
  page_count: number;
  description: string | null;
  created_at: string;
  categories: {
    id: number;
    name: string;
    shelf_prefix: string;
  } | null;
  book_authors: DbBookAuthorRow[] | null;
  book_copies: DbCopyRow[] | null;
}

export class SupabaseBookRepository implements IBookRepository {
  // In-memory fallback deposu (Supabase henüz yapılandırılmadıysa)
  private static localBooks: Map<string, Book> = new Map();
  private static localCopies: Map<string, BookCopy> = new Map();
  private static localCategories: ICategory[] = SEED_DATA.categories.map((c) => ({
    id: c.id,
    name: c.name,
    shelfPrefix: c.shelf_prefix,
  }));
  private static localAuthors: IAuthor[] = SEED_DATA.authors.map((a) => ({
    id: a.id,
    fullName: a.full_name,
    biography: a.biography,
  }));
  private static isInitialized = false;

  constructor() {
    SupabaseBookRepository.ensureInitialized();
  }

  private static ensureInitialized(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Seed verilerini in-memory yükle
    for (const b of SEED_DATA.books) {
      const bookAuthors = this.localAuthors.filter((a) => b.author_ids.includes(a.id));
      const category = this.localCategories.find((c) => c.id === b.category_id);
      const book = new Book({
        id: b.id,
        isbn: b.isbn,
        title: b.title,
        categoryId: b.category_id,
        categoryName: category?.name,
        publisher: b.publisher,
        publishYear: b.publish_year,
        pageCount: b.page_count,
        description: b.description,
        authors: bookAuthors,
        copies: [],
      });
      this.localBooks.set(b.id, book);
    }

    for (const c of SEED_DATA.copies) {
      const copy = new BookCopy({
        id: c.id,
        bookId: c.book_id,
        barcode: c.barcode,
        shelfLocation: c.shelf_location,
        status: c.status as CopyStatus,
        conditionNotes: c.condition_notes,
      });
      this.localCopies.set(c.id, copy);
      const book = this.localBooks.get(c.book_id);
      if (book) {
        book.copies.push(copy);
      }
    }
  }

  public async findById(id: string): Promise<Book | null> {
    if (!isSupabaseConfigured()) {
      return SupabaseBookRepository.localBooks.get(id) ?? null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        categories (*),
        book_authors (
          author_id,
          authors (*)
        ),
        book_copies (*)
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapDbRowToBook(data as unknown as DbBookRow);
  }

  public async findByIsbn(isbn: string): Promise<Book | null> {
    if (!isSupabaseConfigured()) {
      for (const book of SupabaseBookRepository.localBooks.values()) {
        if (book.isbn === isbn) return book;
      }
      return null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        categories (*),
        book_authors (
          author_id,
          authors (*)
        ),
        book_copies (*)
      `
      )
      .eq('isbn', isbn)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToBook(data as unknown as DbBookRow);
  }

  public async findAll(search?: string, categoryId?: number): Promise<Book[]> {
    if (!isSupabaseConfigured()) {
      let results = Array.from(SupabaseBookRepository.localBooks.values());
      if (categoryId) {
        results = results.filter((b) => b.categoryId === categoryId);
      }
      if (search && search.trim() !== '') {
        const query = search.toLowerCase();
        results = results.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            b.isbn.toLowerCase().includes(query) ||
            b.publisher.toLowerCase().includes(query) ||
            b.authors.some((a) => a.fullName.toLowerCase().includes(query))
        );
      }
      return results;
    }

    const supabase = getSupabaseClient();
    let query = supabase.from('books').select(
      `
        *,
        categories (*),
        book_authors (
          author_id,
          authors (*)
        ),
        book_copies (*)
      `
    );

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (search && search.trim() !== '') {
      query = query.or(`title.ilike.%${search}%,isbn.ilike.%${search}%,publisher.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((row) => this.mapDbRowToBook(row as unknown as DbBookRow));
  }

  public async save(book: Book): Promise<Book> {
    if (!isSupabaseConfigured()) {
      SupabaseBookRepository.localBooks.set(book.id, book);
      return book;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('books').upsert({
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      category_id: book.categoryId,
      publisher: book.publisher,
      publish_year: book.publishYear,
      page_count: book.pageCount,
      description: book.description,
    });

    if (error) {
      throw new Error(`Kitap kaydedilemedi: ${error.message}`);
    }

    return book;
  }

  public async update(book: Book): Promise<Book> {
    return this.save(book);
  }

  public async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      SupabaseBookRepository.localBooks.delete(id);
      // Kopyaları da temizle
      for (const [copyId, copy] of SupabaseBookRepository.localCopies.entries()) {
        if (copy.bookId === id) {
          SupabaseBookRepository.localCopies.delete(copyId);
        }
      }
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) {
      throw new Error(`Kitap silinemedi: ${error.message}`);
    }
  }

  public async saveCopy(copy: BookCopy): Promise<BookCopy> {
    if (!isSupabaseConfigured()) {
      SupabaseBookRepository.localCopies.set(copy.id, copy);
      const book = SupabaseBookRepository.localBooks.get(copy.bookId);
      if (book) {
        const existingIdx = book.copies.findIndex((c) => c.id === copy.id);
        if (existingIdx !== -1) {
          book.copies[existingIdx] = copy;
        } else {
          book.copies.push(copy);
        }
      }
      return copy;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('book_copies').upsert({
      id: copy.id,
      book_id: copy.bookId,
      barcode: copy.barcode,
      shelf_location: copy.shelfLocation,
      status: copy.status,
      condition_notes: copy.conditionNotes,
    });

    if (error) {
      throw new Error(`Kopya kaydedilemedi: ${error.message}`);
    }

    return copy;
  }

  public async findCopyById(copyId: string): Promise<BookCopy | null> {
    if (!isSupabaseConfigured()) {
      return SupabaseBookRepository.localCopies.get(copyId) ?? null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('book_copies').select('*').eq('id', copyId).maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToCopy(data as DbCopyRow);
  }

  public async findCopyByBarcode(barcode: string): Promise<BookCopy | null> {
    if (!isSupabaseConfigured()) {
      for (const copy of SupabaseBookRepository.localCopies.values()) {
        if (copy.barcode.toLowerCase() === barcode.toLowerCase().trim()) return copy;
      }
      return null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('book_copies')
      .select('*')
      .eq('barcode', barcode.trim())
      .maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToCopy(data as DbCopyRow);
  }

  public async findCopiesByBookId(bookId: string): Promise<BookCopy[]> {
    if (!isSupabaseConfigured()) {
      return Array.from(SupabaseBookRepository.localCopies.values()).filter((c) => c.bookId === bookId);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('book_copies').select('*').eq('book_id', bookId);

    if (error || !data) return [];
    return data.map((c) => this.mapDbRowToCopy(c as DbCopyRow));
  }

  public async updateCopyStatus(copyId: string, status: CopyStatus): Promise<void> {
    if (!isSupabaseConfigured()) {
      const copy = SupabaseBookRepository.localCopies.get(copyId);
      if (copy) {
        // Durum nesnesine uygun geçiş
        copy.transitionTo(copy.state);
        // Doğrudan durumu güncelleme amacıyla
        (copy as unknown as { _state: { status: CopyStatus } })._state = { status };
      }
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('book_copies').update({ status }).eq('id', copyId);

    if (error) {
      throw new Error(`Kopya durumu güncellenemedi: ${error.message}`);
    }
  }

  public async deleteCopy(copyId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const copy = SupabaseBookRepository.localCopies.get(copyId);
      if (copy) {
        SupabaseBookRepository.localCopies.delete(copyId);
        const book = SupabaseBookRepository.localBooks.get(copy.bookId);
        if (book) {
          book.copies = book.copies.filter((c) => c.id !== copyId);
        }
      }
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('book_copies').delete().eq('id', copyId);
    if (error) {
      throw new Error(`Kopya silinemedi: ${error.message}`);
    }
  }

  public async getCategories(): Promise<ICategory[]> {
    if (!isSupabaseConfigured()) {
      return SupabaseBookRepository.localCategories;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error || !data) return SupabaseBookRepository.localCategories;

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      shelfPrefix: c.shelf_prefix,
    }));
  }

  public async getAuthors(): Promise<IAuthor[]> {
    if (!isSupabaseConfigured()) {
      return SupabaseBookRepository.localAuthors;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('authors').select('*').order('full_name');
    if (error || !data) return SupabaseBookRepository.localAuthors;

    return data.map((a) => ({
      id: a.id,
      fullName: a.full_name,
      biography: a.biography ?? undefined,
    }));
  }

  private mapDbRowToBook(row: DbBookRow): Book {
    const authors: IAuthor[] =
      row.book_authors?.flatMap((ba) =>
        ba.authors
          ? [
              {
                id: ba.authors.id,
                fullName: ba.authors.full_name,
                biography: ba.authors.biography ?? undefined,
              },
            ]
          : []
      ) ?? [];

    const copies: BookCopy[] =
      row.book_copies?.map(
        (c) =>
          new BookCopy({
            id: c.id,
            bookId: c.book_id,
            barcode: c.barcode,
            shelfLocation: c.shelf_location,
            status: c.status,
            conditionNotes: c.condition_notes ?? undefined,
            createdAt: new Date(c.created_at),
          })
      ) ?? [];

    return new Book({
      id: row.id,
      isbn: row.isbn,
      title: row.title,
      categoryId: row.category_id ?? undefined,
      categoryName: row.categories?.name,
      publisher: row.publisher,
      publishYear: row.publish_year,
      pageCount: row.page_count,
      description: row.description ?? undefined,
      authors,
      copies,
      createdAt: new Date(row.created_at),
    });
  }

  private mapDbRowToCopy(c: DbCopyRow): BookCopy {
    return new BookCopy({
      id: c.id,
      bookId: c.book_id,
      barcode: c.barcode,
      shelfLocation: c.shelf_location,
      status: c.status,
      conditionNotes: c.condition_notes ?? undefined,
      createdAt: new Date(c.created_at),
    });
  }
}
