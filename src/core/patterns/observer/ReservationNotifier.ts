import { AuditLog } from '../../entities/AuditLog';
import { IUnitOfWork } from '../../interfaces/IRepositories';
import { CopyStatus } from '../../types/enums';
import { BookReturnEvent, IObserver } from './IObserver';

export class ReservationNotifier implements IObserver<BookReturnEvent> {
  private uow: IUnitOfWork;

  constructor(uow: IUnitOfWork) {
    this.uow = uow;
  }

  public async update(event: BookReturnEvent): Promise<void> {
    // Bu kitaba ait sırada bekleyen aktif bir rezervasyon var mı?
    const nextReservation = await this.uow.reservations.findNextInQueue(event.bookId);

    if (nextReservation) {
      // Kopyayı rezerve durumuna çek
      await this.uow.books.updateCopyStatus(event.bookCopyId, CopyStatus.RESERVED);

      // Rezervasyonu yerine getirildi (veya bekletiliyor) olarak işaretle
      nextReservation.fulfill();
      await this.uow.reservations.update(nextReservation);

      // Bildirim / Audit Log kaydı oluştur
      const log = new AuditLog({
        userId: nextReservation.userId,
        action: 'RESERVATION_NOTIFIED',
        entityName: 'BookCopy',
        entityId: event.bookCopyId,
        details: {
          message: `Rezerve ettiğiniz "${event.bookTitle}" (Barkod: ${event.barcode}) kütüphaneye iade edildi ve sizin için ayrıldı.`,
          reservationId: nextReservation.id,
          queueNumber: nextReservation.queueNumber,
        },
      });
      await this.uow.auditLogs.save(log);
    }
  }
}
