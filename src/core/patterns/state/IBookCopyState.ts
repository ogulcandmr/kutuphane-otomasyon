import { CopyStatus } from '../../types/enums';

export interface IBookCopyContext {
  id: string;
  bookId: string;
  barcode: string;
  shelfLocation: string;
  status: CopyStatus;
  conditionNotes?: string;
  transitionTo(state: IBookCopyState): void;
}

export interface IBookCopyState {
  readonly status: CopyStatus;
  borrow(context: IBookCopyContext): void;
  returnCopy(context: IBookCopyContext): void;
  reserve(context: IBookCopyContext): void;
  sendToMaintenance(context: IBookCopyContext): void;
  markAsLost(context: IBookCopyContext): void;
  restore(context: IBookCopyContext): void;
}
