import {
  IAuditLogRepository,
  IBookRepository,
  IFineRepository,
  ILoanRepository,
  IReservationRepository,
  IUnitOfWork,
  IUserRepository,
} from '../../core/interfaces/IRepositories';
import { SupabaseAuditLogRepository } from './SupabaseAuditLogRepository';
import { SupabaseBookRepository } from './SupabaseBookRepository';
import { SupabaseFineRepository } from './SupabaseFineRepository';
import { SupabaseLoanRepository } from './SupabaseLoanRepository';
import { SupabaseReservationRepository } from './SupabaseReservationRepository';
import { SupabaseUserRepository } from './SupabaseUserRepository';

export class SupabaseUnitOfWork implements IUnitOfWork {
  private static instance: SupabaseUnitOfWork | null = null;

  public readonly books: IBookRepository;
  public readonly users: IUserRepository;
  public readonly loans: ILoanRepository;
  public readonly fines: IFineRepository;
  public readonly reservations: IReservationRepository;
  public readonly auditLogs: IAuditLogRepository;

  constructor() {
    this.books = new SupabaseBookRepository();
    this.users = new SupabaseUserRepository();
    this.loans = new SupabaseLoanRepository();
    this.fines = new SupabaseFineRepository();
    this.reservations = new SupabaseReservationRepository();
    this.auditLogs = new SupabaseAuditLogRepository();
  }

  public static getInstance(): SupabaseUnitOfWork {
    if (!SupabaseUnitOfWork.instance) {
      SupabaseUnitOfWork.instance = new SupabaseUnitOfWork();
    }
    return SupabaseUnitOfWork.instance;
  }
}
