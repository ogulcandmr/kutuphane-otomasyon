import { Loan } from '../../core/entities/Loan';
import { ILoanRepository } from '../../core/interfaces/IRepositories';
import { LoanStatus } from '../../core/types/enums';
import { getSupabaseClient, isSupabaseConfigured } from '../db/supabaseClient';

interface DbLoanRow {
  id: string;
  user_id: string;
  book_copy_id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: LoanStatus;
}

export class SupabaseLoanRepository implements ILoanRepository {
  private static localLoans: Map<string, Loan> = new Map();
  private static isInitialized = false;

  constructor() {
    SupabaseLoanRepository.ensureInitialized();
  }

  private static ensureInitialized(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Kayıt: Ali Yılmaz (Öğrenci) -> Clean Code (Gecikmeli, ceza testi için)
    const loanDate1 = new Date();
    loanDate1.setDate(loanDate1.getDate() - 20);
    const dueDate1 = new Date();
    dueDate1.setDate(dueDate1.getDate() - 5);

    const loan1 = new Loan({
      id: 'd0000000-0000-0000-0000-000000000001',
      userId: 'a0000000-0000-0000-0000-000000000001', // Ali Yılmaz
      bookCopyId: 'c0000000-0000-0000-0000-000000000001', // BC-CS-001
      loanDate: loanDate1,
      dueDate: dueDate1,
      status: LoanStatus.OVERDUE,
    });
    this.localLoans.set(loan1.id, loan1);

    // 2. Kayıt: Ayşe Demir (Akademisyen) -> Refactoring (Aktif zamanında)
    const loanDate2 = new Date();
    loanDate2.setDate(loanDate2.getDate() - 5);
    const dueDate2 = new Date();
    dueDate2.setDate(dueDate2.getDate() + 25);

    const loan2 = new Loan({
      id: 'd0000000-0000-0000-0000-000000000002',
      userId: 'a0000000-0000-0000-0000-000000000002', // Ayşe Demir
      bookCopyId: 'c0000000-0000-0000-0000-000000000003', // BC-CS-003
      loanDate: loanDate2,
      dueDate: dueDate2,
      status: LoanStatus.ACTIVE,
    });
    this.localLoans.set(loan2.id, loan2);

    // 3. Kayıt: Mehmet Kaya (Standart) -> Suç ve Ceza (Aktif zamanında)
    const loanDate3 = new Date();
    loanDate3.setDate(loanDate3.getDate() - 3);
    const dueDate3 = new Date();
    dueDate3.setDate(dueDate3.getDate() + 11);

    const loan3 = new Loan({
      id: 'd0000000-0000-0000-0000-000000000003',
      userId: 'a0000000-0000-0000-0000-000000000003', // Mehmet Kaya
      bookCopyId: 'c0000000-0000-0000-0000-000000000008', // BC-LIT-001
      loanDate: loanDate3,
      dueDate: dueDate3,
      status: LoanStatus.ACTIVE,
    });
    this.localLoans.set(loan3.id, loan3);
  }

  public async findById(id: string): Promise<Loan | null> {
    if (!isSupabaseConfigured()) {
      return SupabaseLoanRepository.localLoans.get(id) ?? null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('loans').select('*').eq('id', id).maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToLoan(data as DbLoanRow);
  }

  public async findActiveLoanByCopyId(copyId: string): Promise<Loan | null> {
    if (!isSupabaseConfigured()) {
      for (const loan of SupabaseLoanRepository.localLoans.values()) {
        if (loan.bookCopyId === copyId && loan.status !== LoanStatus.RETURNED) {
          return loan;
        }
      }
      return null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('book_copy_id', copyId)
      .neq('status', LoanStatus.RETURNED)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToLoan(data as DbLoanRow);
  }

  public async findActiveLoansByUserId(userId: string): Promise<Loan[]> {
    if (!isSupabaseConfigured()) {
      return Array.from(SupabaseLoanRepository.localLoans.values()).filter(
        (l) => l.userId === userId && l.status !== LoanStatus.RETURNED
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .neq('status', LoanStatus.RETURNED);

    if (error || !data) return [];
    return data.map((l) => this.mapDbRowToLoan(l as DbLoanRow));
  }

  public async findAll(status?: LoanStatus): Promise<Loan[]> {
    if (!isSupabaseConfigured()) {
      let list = Array.from(SupabaseLoanRepository.localLoans.values());
      if (status) {
        list = list.filter((l) => l.status === status);
      }
      return list;
    }

    const supabase = getSupabaseClient();
    let query = supabase.from('loans').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('loan_date', { ascending: false });
    if (error || !data) return [];

    return data.map((l) => this.mapDbRowToLoan(l as DbLoanRow));
  }

  public async save(loan: Loan): Promise<Loan> {
    if (!isSupabaseConfigured()) {
      SupabaseLoanRepository.localLoans.set(loan.id, loan);
      return loan;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('loans').upsert({
      id: loan.id,
      user_id: loan.userId,
      book_copy_id: loan.bookCopyId,
      loan_date: loan.loanDate.toISOString(),
      due_date: loan.dueDate.toISOString(),
      return_date: loan.returnDate?.toISOString() ?? null,
      status: loan.status,
    });

    if (error) {
      throw new Error(`Ödünç kaydı yapılamadı: ${error.message}`);
    }

    return loan;
  }

  public async update(loan: Loan): Promise<void> {
    if (!isSupabaseConfigured()) {
      SupabaseLoanRepository.localLoans.set(loan.id, loan);
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('loans')
      .update({
        due_date: loan.dueDate.toISOString(),
        return_date: loan.returnDate?.toISOString() ?? null,
        status: loan.status,
      })
      .eq('id', loan.id);

    if (error) {
      throw new Error(`Ödünç güncelleme hatası: ${error.message}`);
    }
  }

  private mapDbRowToLoan(row: DbLoanRow): Loan {
    return new Loan({
      id: row.id,
      userId: row.user_id,
      bookCopyId: row.book_copy_id,
      loanDate: new Date(row.loan_date),
      dueDate: new Date(row.due_date),
      returnDate: row.return_date ? new Date(row.return_date) : null,
      status: row.status,
    });
  }
}
