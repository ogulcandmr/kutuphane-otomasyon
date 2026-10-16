import { Book } from '../core/entities/Book';
import { BookCopy } from '../core/entities/BookCopy';
import { IUnitOfWork } from '../core/interfaces/IRepositories';
import { CopyStatus } from '../core/types/enums';

export interface ICreateBookInput {
  isbn: string;
  title: string;
  categoryId?: number;
  publisher: string;
  publishYear: number;
  pageCount: number;
  description?: string;
  authorIds?: number[];
  initialCopiesCount?: number;
  shelfLocation?: string;
}

export class CatalogService {
  private uow: IUnitOfWork;

  constructor(uow: IUnitOfWork) {
    this.uow = uow;
  }

  public async getBooks(search?: string, categoryId?: number): Promise<Book[]> {
    return this.uow.books.findAll(search, categoryId);
  }

  public async getBookById(id: string): Promise<Book | null> {
    return this.uow.books.findById(id);
  }

  public async getBookByIsbn(isbn: string): Promise<Book | null> {
    return this.uow.books.findByIsbn(isbn);
  }

  public async getCategories() {
    return this.uow.books.getCategories();
  }

  public async getAuthors() {
    return this.uow.books.getAuthors();
  }

  public async createBook(input: ICreateBookInput): Promise<Book> {
    const existing = await this.uow.books.findByIsbn(input.isbn);
    if (existing) {
      throw new Error(`Bu ISBN (${input.isbn}) numarasına sahip bir kitap zaten mevcut.`);
    }

    const bookId = crypto.randomUUID();
    const authors = await this.uow.books.getAuthors();
    const selectedAuthors = input.authorIds ? authors.filter((a) => input.authorIds?.includes(a.id)) : [];
    const categories = await this.uow.books.getCategories();
    const selectedCategory = input.categoryId ? categories.find((c) => c.id === input.categoryId) : undefined;

    const book = new Book({
      id: bookId,
      isbn: input.isbn,
      title: input.title,
      categoryId: input.categoryId,
      categoryName: selectedCategory?.name,
      publisher: input.publisher,
      publishYear: input.publishYear,
      pageCount: input.pageCount,
      description: input.description,
      authors: selectedAuthors,
      copies: [],
    });

    await this.uow.books.save(book);

    // İlk kopya oluşturma (isteğe bağlı)
    const copyCount = input.initialCopiesCount ?? 1;
    const shelf = input.shelfLocation ?? (selectedCategory ? `${selectedCategory.shelfPrefix}-01` : 'GEN-01');

    for (let i = 1; i <= copyCount; i++) {
      const copyId = crypto.randomUUID();
      const barcode = `BC-${Date.now().toString().slice(-6)}-${i}`;
      const copy = new BookCopy({
        id: copyId,
        bookId,
        barcode,
        shelfLocation: shelf,
        status: CopyStatus.AVAILABLE,
      });
      await this.uow.books.saveCopy(copy);
      book.copies.push(copy);
    }

    return book;
  }

  public async addCopy(bookId: string, barcode: string, shelfLocation: string): Promise<BookCopy> {
    const book = await this.uow.books.findById(bookId);
    if (!book) {
      throw new Error('Kitap bulunamadı.');
    }

    const existingBarcode = await this.uow.books.findCopyByBarcode(barcode);
    if (existingBarcode) {
      throw new Error('Bu barkod başka bir kopyada zaten kullanımda.');
    }

    const copy = new BookCopy({
      id: crypto.randomUUID(),
      bookId,
      barcode,
      shelfLocation,
      status: CopyStatus.AVAILABLE,
    });

    return this.uow.books.saveCopy(copy);
  }

  public async setCopyMaintenance(barcode: string): Promise<void> {
    const copy = await this.uow.books.findCopyByBarcode(barcode);
    if (!copy) throw new Error('Kopya bulunamadı.');
    copy.sendToMaintenance();
    await this.uow.books.updateCopyStatus(copy.id, CopyStatus.MAINTENANCE);
  }

  public async restoreCopy(barcode: string): Promise<void> {
    const copy = await this.uow.books.findCopyByBarcode(barcode);
    if (!copy) throw new Error('Kopya bulunamadı.');
    copy.restore();
    await this.uow.books.updateCopyStatus(copy.id, CopyStatus.AVAILABLE);
  }

  public async updateBook(id: string, input: Partial<ICreateBookInput>): Promise<Book> {
    const book = await this.uow.books.findById(id);
    if (!book) throw new Error('Kitap bulunamadı.');

    const categories = await this.uow.books.getCategories();
    const selectedCategory = input.categoryId
      ? categories.find((c) => c.id === input.categoryId)
      : undefined;

    const updatedBook = new Book({
      id: book.id,
      isbn: input.isbn ?? book.isbn,
      title: input.title ?? book.title,
      categoryId: input.categoryId ?? book.categoryId,
      categoryName: selectedCategory ? selectedCategory.name : book.categoryName,
      publisher: input.publisher ?? book.publisher,
      publishYear: input.publishYear ?? book.publishYear,
      pageCount: input.pageCount ?? book.pageCount,
      description: input.description ?? book.description,
      authors: book.authors,
      copies: book.copies,
      createdAt: book.createdAt,
    });

    return this.uow.books.update(updatedBook);
  }

  public async deleteBook(id: string): Promise<void> {
    const book = await this.uow.books.findById(id);
    if (!book) throw new Error('Kitap bulunamadı.');

    const hasBorrowed = book.copies.some((c) => c.status === CopyStatus.BORROWED);
    if (hasBorrowed) {
      throw new Error(
        'Bu kitaba ait ödünç verilmiş kopyalar bulunmaktadır. Kitap silinemez; önce tüm kopyalar teslim alınmalıdır.'
      );
    }

    await this.uow.books.delete(id);
  }

  public async deleteCopy(copyId: string): Promise<void> {
    const copy = await this.uow.books.findCopyById(copyId);
    if (!copy) throw new Error('Kopya bulunamadı.');

    if (copy.status === CopyStatus.BORROWED) {
      throw new Error('Şu an ödünçte olan bir kopya silinemez.');
    }

    await this.uow.books.deleteCopy(copyId);
  }
}
