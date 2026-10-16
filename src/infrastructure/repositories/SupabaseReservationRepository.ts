import { Reservation } from '../../core/entities/Reservation';
import { IReservationRepository } from '../../core/interfaces/IRepositories';
import { getSupabaseClient, isSupabaseConfigured } from '../db/supabaseClient';

interface DbReservationRow {
  id: string;
  user_id: string;
  book_id: string;
  queue_number: number;
  created_at: string;
  is_active: boolean;
}

export class SupabaseReservationRepository implements IReservationRepository {
  private static localReservations: Map<string, Reservation> = new Map();
  private static isInitialized = false;

  constructor() {
    SupabaseReservationRepository.ensureInitialized();
  }

  private static ensureInitialized(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Örnek aktif rezervasyon (Mehmet Kaya, Clean Code için sırada)
    const sampleReservation = new Reservation({
      id: 'e0000000-0000-0000-0000-000000000001',
      userId: 'a0000000-0000-0000-0000-000000000003', // Mehmet Kaya
      bookId: 'b0000000-0000-0000-0000-000000000001', // Clean Code
      queueNumber: 1,
      isActive: true,
    });
    this.localReservations.set(sampleReservation.id, sampleReservation);
  }

  public async findActiveByBookId(bookId: string): Promise<Reservation[]> {
    if (!isSupabaseConfigured()) {
      return Array.from(SupabaseReservationRepository.localReservations.values())
        .filter((r) => r.bookId === bookId && r.isActive)
        .sort((a, b) => a.queueNumber - b.queueNumber);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('book_id', bookId)
      .eq('is_active', true)
      .order('queue_number', { ascending: true });

    if (error || !data) return [];
    return data.map((r) => this.mapDbRowToReservation(r as DbReservationRow));
  }

  public async findNextInQueue(bookId: string): Promise<Reservation | null> {
    const list = await this.findActiveByBookId(bookId);
    return list.length > 0 ? list[0] : null;
  }

  public async findActiveByUserId(userId: string): Promise<Reservation[]> {
    if (!isSupabaseConfigured()) {
      return Array.from(SupabaseReservationRepository.localReservations.values()).filter(
        (r) => r.userId === userId && r.isActive
      );
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !data) return [];
    return data.map((r) => this.mapDbRowToReservation(r as DbReservationRow));
  }

  public async save(reservation: Reservation): Promise<Reservation> {
    if (!isSupabaseConfigured()) {
      SupabaseReservationRepository.localReservations.set(reservation.id, reservation);
      return reservation;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('reservations').upsert({
      id: reservation.id,
      user_id: reservation.userId,
      book_id: reservation.bookId,
      queue_number: reservation.queueNumber,
      is_active: reservation.isActive,
    });

    if (error) {
      throw new Error(`Rezervasyon kaydedilemedi: ${error.message}`);
    }

    return reservation;
  }

  public async update(reservation: Reservation): Promise<void> {
    if (!isSupabaseConfigured()) {
      SupabaseReservationRepository.localReservations.set(reservation.id, reservation);
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('reservations')
      .update({
        queue_number: reservation.queueNumber,
        is_active: reservation.isActive,
      })
      .eq('id', reservation.id);

    if (error) {
      throw new Error(`Rezervasyon güncelleme hatası: ${error.message}`);
    }
  }

  private mapDbRowToReservation(row: DbReservationRow): Reservation {
    return new Reservation({
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      queueNumber: row.queue_number,
      createdAt: new Date(row.created_at),
      isActive: row.is_active,
    });
  }
}
