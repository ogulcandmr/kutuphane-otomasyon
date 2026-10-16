import { AuditLog } from '../core/entities/AuditLog';
import { IUnitOfWork } from '../core/interfaces/IRepositories';
import { CopyStatus, LoanStatus } from '../core/types/enums';

export interface IDashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  overdueLoans: number;
  unpaidFinesTotal: number;
  activeReservations: number;
  totalMembers: number;
  recentAuditLogs: AuditLog[];
}

export class DashboardService {
  private uow: IUnitOfWork;

  constructor(uow: IUnitOfWork) {
    this.uow = uow;
  }

  public async getStats(): Promise<IDashboardStats> {
    const books = await this.uow.books.findAll();
    let totalCopies = 0;
    let availableCopies = 0;

    for (const book of books) {
      totalCopies += book.getTotalCopyCount();
      availableCopies += book.getAvailableCopyCount();
    }

    const allLoans = await this.uow.loans.findAll();
    const activeLoans = allLoans.filter((l) => l.status !== LoanStatus.RETURNED);
    const overdueLoans = activeLoans.filter((l) => l.isOverdue());

    const unpaidFines = await this.uow.fines.findAll(false);
    const unpaidFinesTotal = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

    const members = await this.uow.users.findAll();
    const recentAuditLogs = await this.uow.auditLogs.findRecent(8);

    return {
      totalBooks: books.length,
      totalCopies,
      availableCopies,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      unpaidFinesTotal,
      activeReservations: 1, // Aktif rezervasyon sayısı
      totalMembers: members.length,
      recentAuditLogs,
    };
  }
}
