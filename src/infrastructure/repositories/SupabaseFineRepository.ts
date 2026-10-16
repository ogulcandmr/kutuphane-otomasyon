import { Fine } from '../../core/entities/Fine';
import { IFineRepository } from '../../core/interfaces/IRepositories';
import { getSupabaseClient, isSupabaseConfigured } from '../db/supabaseClient';

interface DbFineRow {
  id: string;
  loan_id: string;
  user_id: string;
  amount: number;
  is_paid: boolean;
  calculated_at: string;
  paid_at: string | null;
}

export class SupabaseFineRepository implements IFineRepository {
  private static localFines: Map<string, Fine> = new Map();
  private static isInitialized = false;

  constructor() {
    SupabaseFineRepository.ensureInitialized();
  }

  private static ensureInitialized(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Örnek gecikmiş ceza (Ali Yılmaz için 5 gün * 5 TL = 25 TL)
    const sampleFine = new Fine({
      id: 'f0000000-0000-0000-0000-000000000001',
      loanId: 'd0000000-0000-0000-0000-000000000001',
      userId: 'a0000000-0000-0000-0000-000000000001',
      amount: 25.0,
      isPaid: false,
    });
    this.localFines.set(sampleFine.id, sampleFine);
  }

  public async findById(id: string): Promise<Fine | null> {
    if (!isSupabaseConfigured()) {
      return SupabaseFineRepository.localFines.get(id) ?? null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('fines').select('*').eq('id', id).maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToFine(data as DbFineRow);
  }

  public async findByLoanId(loanId: string): Promise<Fine | null> {
    if (!isSupabaseConfigured()) {
      for (const fine of SupabaseFineRepository.localFines.values()) {
        if (fine.loanId === loanId) return fine;
      }
      return null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('fines').select('*').eq('loan_id', loanId).maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToFine(data as DbFineRow);
  }

  public async findUnpaidFinesByUserId(userId: string): Promise<Fine[]> {
    if (!isSupabaseConfigured()) {
      return Array.from(SupabaseFineRepository.localFines.values()).filter(
        (f) => f.userId === userId && !f.isPaid
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('fines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_paid', false);

    if (error || !data) return [];
    return data.map((f) => this.mapDbRowToFine(f as DbFineRow));
  }

  public async findAll(isPaid?: boolean): Promise<Fine[]> {
    if (!isSupabaseConfigured()) {
      let list = Array.from(SupabaseFineRepository.localFines.values());
      if (typeof isPaid === 'boolean') {
        list = list.filter((f) => f.isPaid === isPaid);
      }
      return list;
    }

    const supabase = getSupabaseClient();
    let query = supabase.from('fines').select('*');

    if (typeof isPaid === 'boolean') {
      query = query.eq('is_paid', isPaid);
    }

    const { data, error } = await query.order('calculated_at', { ascending: false });
    if (error || !data) return [];

    return data.map((f) => this.mapDbRowToFine(f as DbFineRow));
  }

  public async save(fine: Fine): Promise<Fine> {
    if (!isSupabaseConfigured()) {
      SupabaseFineRepository.localFines.set(fine.id, fine);
      return fine;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('fines').upsert({
      id: fine.id,
      loan_id: fine.loanId,
      user_id: fine.userId,
      amount: fine.amount,
      is_paid: fine.isPaid,
      calculated_at: fine.calculatedAt.toISOString(),
      paid_at: fine.paidAt?.toISOString() ?? null,
    });

    if (error) {
      throw new Error(`Ceza kaydı yapılamadı: ${error.message}`);
    }

    return fine;
  }

  public async update(fine: Fine): Promise<void> {
    if (!isSupabaseConfigured()) {
      SupabaseFineRepository.localFines.set(fine.id, fine);
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('fines')
      .update({
        amount: fine.amount,
        is_paid: fine.isPaid,
        paid_at: fine.paidAt?.toISOString() ?? null,
      })
      .eq('id', fine.id);

    if (error) {
      throw new Error(`Ceza güncelleme hatası: ${error.message}`);
    }
  }

  private mapDbRowToFine(row: DbFineRow): Fine {
    return new Fine({
      id: row.id,
      loanId: row.loan_id,
      userId: row.user_id,
      amount: Number(row.amount),
      isPaid: row.is_paid,
      calculatedAt: new Date(row.calculated_at),
      paidAt: row.paid_at ? new Date(row.paid_at) : null,
    });
  }
}
