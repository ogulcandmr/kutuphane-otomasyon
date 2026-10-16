import { LIBRARY_RULES } from '../constants/libraryRules';
import { AcademicFineStrategy, StandardFineStrategy, StudentFineStrategy } from '../patterns/strategy/FineStrategies';
import { IFineCalculationStrategy } from '../patterns/strategy/IFineCalculationStrategy';
import { UserRole, UserType } from '../types/enums';

export interface IUserProps {
  id: string;
  studentOrStaffId: string;
  fullName: string;
  email: string;
  role: UserRole;
  userType: UserType;
  maxBorrowLimit?: number;
  createdAt?: Date;
}

export abstract class User {
  public readonly id: string;
  public readonly studentOrStaffId: string;
  public readonly fullName: string;
  public readonly email: string;
  public readonly role: UserRole;
  public readonly userType: UserType;
  public readonly maxBorrowLimit: number;
  public readonly createdAt: Date;

  constructor(props: IUserProps) {
    this.id = props.id;
    this.studentOrStaffId = props.studentOrStaffId;
    this.fullName = props.fullName;
    this.email = props.email;
    this.role = props.role;
    this.userType = props.userType;
    this.maxBorrowLimit = props.maxBorrowLimit ?? this.getDefaultBorrowLimit();
    this.createdAt = props.createdAt ?? new Date();
  }

  public canBorrow(currentLoanCount: number, unpaidFinesTotal: number = 0): boolean {
    if (unpaidFinesTotal > 0) {
      return false;
    }
    return currentLoanCount < this.maxBorrowLimit;
  }

  protected abstract getDefaultBorrowLimit(): number;
  public abstract getFineStrategy(): IFineCalculationStrategy;
  public abstract getDefaultLoanDurationDays(): number;
}

export class StudentUser extends User {
  constructor(props: Omit<IUserProps, 'userType'>) {
    super({ ...props, userType: UserType.STUDENT });
  }

  protected getDefaultBorrowLimit(): number {
    return LIBRARY_RULES.BORROW_LIMITS.STUDENT;
  }

  public getFineStrategy(): IFineCalculationStrategy {
    return new StudentFineStrategy();
  }

  public getDefaultLoanDurationDays(): number {
    return LIBRARY_RULES.LOAN_DURATIONS_DAYS.STUDENT;
  }
}

export class AcademicUser extends User {
  constructor(props: Omit<IUserProps, 'userType'>) {
    super({ ...props, userType: UserType.ACADEMIC });
  }

  protected getDefaultBorrowLimit(): number {
    return LIBRARY_RULES.BORROW_LIMITS.ACADEMIC;
  }

  public getFineStrategy(): IFineCalculationStrategy {
    return new AcademicFineStrategy();
  }

  public getDefaultLoanDurationDays(): number {
    return LIBRARY_RULES.LOAN_DURATIONS_DAYS.ACADEMIC;
  }
}

export class StandardUser extends User {
  constructor(props: Omit<IUserProps, 'userType'>) {
    super({ ...props, userType: UserType.STANDARD });
  }

  protected getDefaultBorrowLimit(): number {
    return LIBRARY_RULES.BORROW_LIMITS.STANDARD;
  }

  public getFineStrategy(): IFineCalculationStrategy {
    return new StandardFineStrategy();
  }

  public getDefaultLoanDurationDays(): number {
    return LIBRARY_RULES.LOAN_DURATIONS_DAYS.STANDARD;
  }
}

export class UserFactory {
  public static create(props: IUserProps): User {
    switch (props.userType) {
      case UserType.STUDENT:
        return new StudentUser(props);
      case UserType.ACADEMIC:
        return new AcademicUser(props);
      case UserType.STANDARD:
      default:
        return new StandardUser(props);
    }
  }
}
