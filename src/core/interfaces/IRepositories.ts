import { AuditLog } from '../entities/AuditLog';
import { Book, IAuthor, ICategory } from '../entities/Book';
import { BookCopy } from '../entities/BookCopy';
import { Fine } from '../entities/Fine';
import { Loan } from '../entities/Loan';
import { Reservation } from '../entities/Reservation';
import { User } from '../entities/User';
import { CopyStatus, LoanStatus } from '../types/enums';

export interface IBookRepository {
  findById(id: string): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  findAll(search?: string, categoryId?: number): Promise<Book[]>;
  save(book: Book): Promise<Book>;
  update(book: Book): Promise<Book>;
  delete(id: string): Promise<void>;
  saveCopy(copy: BookCopy): Promise<BookCopy>;
  findCopyById(copyId: string): Promise<BookCopy | null>;
  findCopyByBarcode(barcode: string): Promise<BookCopy | null>;
  findCopiesByBookId(bookId: string): Promise<BookCopy[]>;
  updateCopyStatus(copyId: string, status: CopyStatus): Promise<void>;
  deleteCopy(copyId: string): Promise<void>;
  getCategories(): Promise<ICategory[]>;
  getAuthors(): Promise<IAuthor[]>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByStudentOrStaffId(studentOrStaffId: string): Promise<User | null>;
  findAll(search?: string): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface ILoanRepository {
  findById(id: string): Promise<Loan | null>;
  findActiveLoanByCopyId(copyId: string): Promise<Loan | null>;
  findActiveLoansByUserId(userId: string): Promise<Loan[]>;
  findAll(status?: LoanStatus): Promise<Loan[]>;
  save(loan: Loan): Promise<Loan>;
  update(loan: Loan): Promise<void>;
}

export interface IFineRepository {
  findById(id: string): Promise<Fine | null>;
  findByLoanId(loanId: string): Promise<Fine | null>;
  findUnpaidFinesByUserId(userId: string): Promise<Fine[]>;
  findAll(isPaid?: boolean): Promise<Fine[]>;
  save(fine: Fine): Promise<Fine>;
  update(fine: Fine): Promise<void>;
}

export interface IReservationRepository {
  findActiveByBookId(bookId: string): Promise<Reservation[]>;
  findNextInQueue(bookId: string): Promise<Reservation | null>;
  findActiveByUserId(userId: string): Promise<Reservation[]>;
  save(reservation: Reservation): Promise<Reservation>;
  update(reservation: Reservation): Promise<void>;
}

export interface IAuditLogRepository {
  save(log: AuditLog): Promise<void>;
  findRecent(limit?: number): Promise<AuditLog[]>;
}

export interface IUnitOfWork {
  readonly books: IBookRepository;
  readonly users: IUserRepository;
  readonly loans: ILoanRepository;
  readonly fines: IFineRepository;
  readonly reservations: IReservationRepository;
  readonly auditLogs: IAuditLogRepository;
}
