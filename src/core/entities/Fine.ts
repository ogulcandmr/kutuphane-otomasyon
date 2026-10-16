export interface IFineProps {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  isPaid?: boolean;
  calculatedAt?: Date;
  paidAt?: Date | null;
}

export class Fine {
  public readonly id: string;
  public readonly loanId: string;
  public readonly userId: string;
  public amount: number;
  public isPaid: boolean;
  public readonly calculatedAt: Date;
  public paidAt?: Date | null;

  constructor(props: IFineProps) {
    this.id = props.id;
    this.loanId = props.loanId;
    this.userId = props.userId;
    this.amount = props.amount;
    this.isPaid = props.isPaid ?? false;
    this.calculatedAt = props.calculatedAt ?? new Date();
    this.paidAt = props.paidAt ?? null;
  }

  public pay(): void {
    this.isPaid = true;
    this.paidAt = new Date();
  }
}
