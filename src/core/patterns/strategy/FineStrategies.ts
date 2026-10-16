import { LIBRARY_RULES } from '../../constants/libraryRules';
import { UserType } from '../../types/enums';
import { IFineCalculationStrategy } from './IFineCalculationStrategy';

export class StudentFineStrategy implements IFineCalculationStrategy {
  public readonly userType: UserType = UserType.STUDENT;
  public readonly dailyRate: number = LIBRARY_RULES.FINE_RATES.STUDENT;

  public calculateFine(daysOverdue: number): number {
    if (daysOverdue <= 0) return 0;
    return daysOverdue * this.dailyRate;
  }
}

export class AcademicFineStrategy implements IFineCalculationStrategy {
  public readonly userType: UserType = UserType.ACADEMIC;
  public readonly dailyRate: number = LIBRARY_RULES.FINE_RATES.ACADEMIC;

  public calculateFine(daysOverdue: number): number {
    if (daysOverdue <= 0) return 0;
    return daysOverdue * this.dailyRate;
  }
}

export class StandardFineStrategy implements IFineCalculationStrategy {
  public readonly userType: UserType = UserType.STANDARD;
  public readonly dailyRate: number = LIBRARY_RULES.FINE_RATES.STANDARD;

  public calculateFine(daysOverdue: number): number {
    if (daysOverdue <= 0) return 0;
    return daysOverdue * this.dailyRate;
  }
}

export class FineStrategyFactory {
  private static strategies: Map<UserType, IFineCalculationStrategy> = new Map([
    [UserType.STUDENT, new StudentFineStrategy()],
    [UserType.ACADEMIC, new AcademicFineStrategy()],
    [UserType.STANDARD, new StandardFineStrategy()],
  ]);

  public static getStrategy(userType: UserType): IFineCalculationStrategy {
    const strategy = this.strategies.get(userType);
    if (!strategy) {
      return new StandardFineStrategy();
    }
    return strategy;
  }
}
