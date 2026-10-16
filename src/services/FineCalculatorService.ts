import { AuditLog } from '../core/entities/AuditLog';
import { Fine } from '../core/entities/Fine';
import { IUnitOfWork } from '../core/interfaces/IRepositories';
import { FineStrategyFactory } from '../core/patterns/strategy/FineStrategies';
import { UserType } from '../core/types/enums';

export interface IFineWithDetails {
  fine: Fine;
  userName: string;
  userType: UserType;
  studentOrStaffId: string;
}

export class FineCalculatorService {
  private uow: IUnitOfWork;

  constructor(uow: IUnitOfWork) {
    this.uow = uow;
  }

  public async getFines(isPaid?: boolean): Promise<IFineWithDetails[]> {
    const fines = await this.uow.fines.findAll(isPaid);
    const result: IFineWithDetails[] = [];

    for (const fine of fines) {
      const user = await this.uow.users.findById(fine.userId);
      result.push({
        fine,
        userName: user?.fullName ?? 'Bilinmeyen Kullanıcı',
        userType: user?.userType ?? UserType.STANDARD,
        studentOrStaffId: user?.studentOrStaffId ?? '-',
      });
    }

    return result;
  }

  public async payFine(fineId: string): Promise<Fine> {
    const fine = await this.uow.fines.findById(fineId);
    if (!fine) {
      throw new Error('Ceza kaydı bulunamadı.');
    }

    if (fine.isPaid) {
      throw new Error('Bu ceza zaten ödenmiştir.');
    }

    fine.pay();
    await this.uow.fines.update(fine);

    await this.uow.auditLogs.save(
      new AuditLog({
        userId: fine.userId,
        action: 'FINE_PAID',
        entityName: 'Fine',
        entityId: fine.id,
        details: {
          amount: fine.amount,
          paidAt: fine.paidAt?.toISOString(),
        },
      })
    );

    return fine;
  }

  /**
   * Strategy Pattern hesaplama simülasyonu
   */
  public calculatePreview(userType: UserType, daysOverdue: number): number {
    const strategy = FineStrategyFactory.getStrategy(userType);
    return strategy.calculateFine(daysOverdue);
  }
}
