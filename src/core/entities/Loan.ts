import { LoanStatus } from '../types/enums';

export interface ILoanProps {
  id: string;
  userId: string;
  bookCopyId: string;
  loanDate?: Date;
  dueDate: Date;
  returnDate?: Date | null;
  status?: LoanStatus;
}

export class Loan {
  public readonly id: string;
  public readonly userId: string;
  public readonly bookCopyId: string;
  public readonly loanDate: Date;
  public dueDate: Date;
  public returnDate?: Date | null;
  private _status: LoanStatus;

  constructor(props: ILoanProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.bookCopyId = props.bookCopyId;
    this.loanDate = props.loanDate ?? new Date();
    this.dueDate = props.dueDate;
    this.returnDate = props.returnDate ?? null;
    this._status = props.status ?? (this.isOverdue() ? LoanStatus.OVERDUE : LoanStatus.ACTIVE);
  }

  public get status(): LoanStatus {
    if (this._status === LoanStatus.RETURNED) {
      return LoanStatus.RETURNED;
    }
    return this.isOverdue() ? LoanStatus.OVERDUE : LoanStatus.ACTIVE;
  }

  public isOverdue(asOfDate: Date = new Date()): boolean {
    if (this.returnDate) {
      return this.returnDate.getTime() > this.dueDate.getTime();
    }
    return asOfDate.getTime() > this.dueDate.getTime();
  }

  public getOverdueDays(asOfDate: Date = new Date()): number {
    const referenceDate = this.returnDate ?? asOfDate;
    if (referenceDate.getTime() <= this.dueDate.getTime()) {
      return 0;
    }
    const diffMs = referenceDate.getTime() - this.dueDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  public markReturned(returnDate: Date = new Date()): void {
    this.returnDate = returnDate;
    this._status = LoanStatus.RETURNED;
  }

  public extendDueDate(days: number): void {
    const newDueDate = new Date(this.dueDate);
    newDueDate.setDate(newDueDate.getDate() + days);
    this.dueDate = newDueDate;
    if (!this.isOverdue()) {
      this._status = LoanStatus.ACTIVE;
    }
  }
}
