export interface BookReturnEvent {
  bookId: string;
  bookCopyId: string;
  barcode: string;
  bookTitle: string;
  returnedAt: Date;
}

export interface IObserver<T = unknown> {
  update(event: T): Promise<void> | void;
}

export interface ISubject<T = unknown> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(event: T): Promise<void>;
}
