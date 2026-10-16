import { UserType } from '../../types/enums';

export interface IFineCalculationStrategy {
  readonly userType: UserType;
  readonly dailyRate: number;
  calculateFine(daysOverdue: number): number;
}
