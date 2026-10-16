import { BookCopyStateFactory } from '../patterns/state/BookCopyStates';
import { IBookCopyContext, IBookCopyState } from '../patterns/state/IBookCopyState';
import { CopyStatus } from '../types/enums';

export interface IBookCopyProps {
  id: string;
  bookId: string;
  barcode: string;
  shelfLocation: string;
  status?: CopyStatus;
  conditionNotes?: string;
  createdAt?: Date;
}

export class BookCopy implements IBookCopyContext {
  public readonly id: string;
  public readonly bookId: string;
  public readonly barcode: string;
  public shelfLocation: string;
  public conditionNotes?: string;
  public readonly createdAt: Date;

  private _state: IBookCopyState;

  constructor(props: IBookCopyProps) {
    this.id = props.id;
    this.bookId = props.bookId;
    this.barcode = props.barcode;
    this.shelfLocation = props.shelfLocation;
    this.conditionNotes = props.conditionNotes;
    this.createdAt = props.createdAt ?? new Date();

    const initialStatus = props.status ?? CopyStatus.AVAILABLE;
    this._state = BookCopyStateFactory.createState(initialStatus);
  }

  public get status(): CopyStatus {
    return this._state.status;
  }

  public get state(): IBookCopyState {
    return this._state;
  }

  public transitionTo(state: IBookCopyState): void {
    this._state = state;
  }

  public borrow(): void {
    this._state.borrow(this);
  }

  public returnCopy(): void {
    this._state.returnCopy(this);
  }

  public reserve(): void {
    this._state.reserve(this);
  }

  public sendToMaintenance(): void {
    this._state.sendToMaintenance(this);
  }

  public markAsLost(): void {
    this._state.markAsLost(this);
  }

  public restore(): void {
    this._state.restore(this);
  }
}
