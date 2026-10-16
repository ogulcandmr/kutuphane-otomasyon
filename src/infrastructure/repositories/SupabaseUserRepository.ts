import { User, UserFactory } from '../../core/entities/User';
import { IUserRepository } from '../../core/interfaces/IRepositories';
import { UserRole, UserType } from '../../core/types/enums';
import { SEED_DATA } from '../db/seedData';
import { getSupabaseClient, isSupabaseConfigured } from '../db/supabaseClient';

interface DbUserRow {
  id: string;
  student_or_staff_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  user_type: UserType;
  max_borrow_limit: number;
  created_at: string;
}

export class SupabaseUserRepository implements IUserRepository {
  private static localUsers: Map<string, User> = new Map();
  private static isInitialized = false;

  constructor() {
    SupabaseUserRepository.ensureInitialized();
  }

  private static ensureInitialized(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    for (const u of SEED_DATA.users) {
      const user = UserFactory.create({
        id: u.id,
        studentOrStaffId: u.student_or_staff_id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        userType: u.user_type,
        maxBorrowLimit: u.max_borrow_limit,
      });
      this.localUsers.set(u.id, user);
    }
  }

  public async findById(id: string): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      return SupabaseUserRepository.localUsers.get(id) ?? null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToUser(data as DbUserRow);
  }

  public async findByStudentOrStaffId(studentOrStaffId: string): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      for (const user of SupabaseUserRepository.localUsers.values()) {
        if (user.studentOrStaffId.toLowerCase() === studentOrStaffId.toLowerCase().trim()) {
          return user;
        }
      }
      return null;
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('student_or_staff_id', studentOrStaffId.trim())
      .maybeSingle();

    if (error || !data) return null;
    return this.mapDbRowToUser(data as DbUserRow);
  }

  public async findAll(search?: string): Promise<User[]> {
    if (!isSupabaseConfigured()) {
      let list = Array.from(SupabaseUserRepository.localUsers.values());
      if (search && search.trim() !== '') {
        const q = search.toLowerCase();
        list = list.filter(
          (u) =>
            u.fullName.toLowerCase().includes(q) ||
            u.studentOrStaffId.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
      }
      return list;
    }

    const supabase = getSupabaseClient();
    let query = supabase.from('users').select('*');

    if (search && search.trim() !== '') {
      query = query.or(
        `full_name.ilike.%${search}%,student_or_staff_id.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((u) => this.mapDbRowToUser(u as DbUserRow));
  }

  public async save(user: User): Promise<User> {
    if (!isSupabaseConfigured()) {
      SupabaseUserRepository.localUsers.set(user.id, user);
      return user;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      student_or_staff_id: user.studentOrStaffId,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      user_type: user.userType,
      max_borrow_limit: user.maxBorrowLimit,
    });

    if (error) {
      throw new Error(`Kullanıcı kaydedilemedi: ${error.message}`);
    }

    return user;
  }

  public async update(user: User): Promise<User> {
    return this.save(user);
  }

  public async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      SupabaseUserRepository.localUsers.delete(id);
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      throw new Error(`Kullanıcı silinemedi: ${error.message}`);
    }
  }

  private mapDbRowToUser(row: DbUserRow): User {
    return UserFactory.create({
      id: row.id,
      studentOrStaffId: row.student_or_staff_id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      userType: row.user_type,
      maxBorrowLimit: row.max_borrow_limit,
      createdAt: new Date(row.created_at),
    });
  }
}
