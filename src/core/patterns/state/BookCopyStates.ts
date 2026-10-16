import { CopyStatus } from '../../types/enums';
import { IBookCopyContext, IBookCopyState } from './IBookCopyState';

export class AvailableState implements IBookCopyState {
  public readonly status: CopyStatus = CopyStatus.AVAILABLE;

  public borrow(context: IBookCopyContext): void {
    context.transitionTo(new BorrowedState());
  }

  public returnCopy(_context: IBookCopyContext): void {
    throw new Error('Kitap kopyası zaten rafta (AVAILABLE). İade edilemez.');
  }

  public reserve(context: IBookCopyContext): void {
    context.transitionTo(new ReservedState());
  }

  public sendToMaintenance(context: IBookCopyContext): void {
    context.transitionTo(new UnderMaintenanceState());
  }

  public markAsLost(context: IBookCopyContext): void {
    context.transitionTo(new LostState());
  }

  public restore(_context: IBookCopyContext): void {
    // Zaten rafta
  }
}

export class BorrowedState implements IBookCopyState {
  public readonly status: CopyStatus = CopyStatus.BORROWED;

  public borrow(_context: IBookCopyContext): void {
    throw new Error('Kitap kopyası şu anda ödünçte (BORROWED). Tekrar ödünç verilemez.');
  }

  public returnCopy(context: IBookCopyContext): void {
    context.transitionTo(new AvailableState());
  }

  public reserve(_context: IBookCopyContext): void {
    throw new Error('Ödünçteki kopyanın durumu doğrudan RESERVED yapılamaz; rezervasyon kuyruğuna alınır.');
  }

  public sendToMaintenance(_context: IBookCopyContext): void {
    throw new Error('Ödünçte olan kitap önce teslim alınmalıdır.');
  }

  public markAsLost(context: IBookCopyContext): void {
    context.transitionTo(new LostState());
  }

  public restore(_context: IBookCopyContext): void {
    throw new Error('Ödünçteki kitap için doğrudan restore çağrılamaz.');
  }
}

export class ReservedState implements IBookCopyState {
  public readonly status: CopyStatus = CopyStatus.RESERVED;

  public borrow(context: IBookCopyContext): void {
    context.transitionTo(new BorrowedState());
  }

  public returnCopy(_context: IBookCopyContext): void {
    throw new Error('Rezerve edilmiş kitap doğrudan iade edilemez.');
  }

  public reserve(_context: IBookCopyContext): void {
    throw new Error('Bu kopya zaten rezerve edilmiş durumda.');
  }

  public sendToMaintenance(context: IBookCopyContext): void {
    context.transitionTo(new UnderMaintenanceState());
  }

  public markAsLost(context: IBookCopyContext): void {
    context.transitionTo(new LostState());
  }

  public restore(context: IBookCopyContext): void {
    context.transitionTo(new AvailableState());
  }
}

export class UnderMaintenanceState implements IBookCopyState {
  public readonly status: CopyStatus = CopyStatus.MAINTENANCE;

  public borrow(_context: IBookCopyContext): void {
    throw new Error('Kitap bakımda/tamirde olduğu için ödünç verilemez.');
  }

  public returnCopy(_context: IBookCopyContext): void {
    throw new Error('Bakımdaki kitap için iade işlemi uygulanamaz.');
  }

  public reserve(_context: IBookCopyContext): void {
    throw new Error('Bakımdaki kitap rezerve edilemez.');
  }

  public sendToMaintenance(_context: IBookCopyContext): void {
    // Zaten bakımda
  }

  public markAsLost(context: IBookCopyContext): void {
    context.transitionTo(new LostState());
  }

  public restore(context: IBookCopyContext): void {
    context.transitionTo(new AvailableState());
  }
}

export class LostState implements IBookCopyState {
  public readonly status: CopyStatus = CopyStatus.LOST;

  public borrow(_context: IBookCopyContext): void {
    throw new Error('Kayıp kitap ödünç verilemez.');
  }

  public returnCopy(_context: IBookCopyContext): void {
    throw new Error('Kayıp kitap önce rafta durumuna alınmalıdır.');
  }

  public reserve(_context: IBookCopyContext): void {
    throw new Error('Kayıp kitap rezerve edilemez.');
  }

  public sendToMaintenance(_context: IBookCopyContext): void {
    throw new Error('Kayıp kitap bakıma alınamaz.');
  }

  public markAsLost(_context: IBookCopyContext): void {
    // Zaten kayıp
  }

  public restore(context: IBookCopyContext): void {
    context.transitionTo(new AvailableState());
  }
}

export class BookCopyStateFactory {
  public static createState(status: CopyStatus): IBookCopyState {
    switch (status) {
      case CopyStatus.AVAILABLE:
        return new AvailableState();
      case CopyStatus.BORROWED:
        return new BorrowedState();
      case CopyStatus.RESERVED:
        return new ReservedState();
      case CopyStatus.MAINTENANCE:
        return new UnderMaintenanceState();
      case CopyStatus.LOST:
        return new LostState();
      default:
        return new AvailableState();
    }
  }
}
