export interface IReservationProps {
  id: string;
  userId: string;
  bookId: string;
  queueNumber: number;
  createdAt?: Date;
  isActive?: boolean;
}

export class Reservation {
  public readonly id: string;
  public readonly userId: string;
  public readonly bookId: string;
  public queueNumber: number;
  public readonly createdAt: Date;
  public isActive: boolean;

  constructor(props: IReservationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.bookId = props.bookId;
    this.queueNumber = props.queueNumber;
    this.createdAt = props.createdAt ?? new Date();
    this.isActive = props.isActive ?? true;
  }

  public fulfill(): void {
    this.isActive = false;
  }

  public cancel(): void {
    this.isActive = false;
  }
}
