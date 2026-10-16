import { AuditLog } from '../core/entities/AuditLog';
import { Fine } from '../core/entities/Fine';
import { Loan } from '../core/entities/Loan';
import { IUnitOfWork } from '../core/interfaces/IRepositories';
import { CirculationDeskSubject } from '../core/patterns/observer/CirculationDeskSubject';
import { ReservationNotifier } from '../core/patterns/observer/ReservationNotifier';
import { CopyStatus, LoanStatus } from '../core/types/enums';

export interface IBorrowResult {
  success: boolean;
  message: string;
  loan?: Loan;
}

export interface IReturnResult {
  success: boolean;
  message: string;
  fine?: Fine;
  overdueDays: number;
}

export interface IExtendResult {
  success: boolean;
  message: string;
  newDueDate?: Date;
}

export class CirculationService {
  private uow: IUnitOfWork;
  private deskSubject: CirculationDeskSubject;

  constructor(uow: IUnitOfWork) {
    this.uow = uow;
    this.deskSubject = new CirculationDeskSubject();

    // Observer'ı bağla
    const reservationNotifier = new ReservationNotifier(uow);
    this.deskSubject.attach(reservationNotifier);
  }

  /**
   * Kitap Ödünç Verme İş Akışı
   */
  public async borrowBook(userIdOrIdentifier: string, barcode: string): Promise<IBorrowResult> {
    // 1. Kullanıcıyı bul (UUID veya Öğrenci/Sicil No ile)
    let user = await this.uow.users.findById(userIdOrIdentifier);
    if (!user) {
      user = await this.uow.users.findByStudentOrStaffId(userIdOrIdentifier);
    }
    if (!user) {
      return { success: false, message: 'Üye bulunamadı.' };
    }

    // 2. Ödenmemiş ceza kontrolü
    const unpaidFines = await this.uow.fines.findUnpaidFinesByUserId(user.id);
    const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    if (totalUnpaid > 0) {
      return {
        success: false,
        message: `Üyenin ödenmemiş ${totalUnpaid.toFixed(2)} TL cezası bulunmaktadır. Önce ceza tahsil edilmelidir.`,
      };
    }

    // 3. Aktif ödünç limiti / kota kontrolü
    const activeLoans = await this.uow.loans.findActiveLoansByUserId(user.id);
    if (!user.canBorrow(activeLoans.length, totalUnpaid)) {
      return {
        success: false,
        message: `Üye ödünç limitine (${user.maxBorrowLimit} kitap) ulaşmıştır. Yeni kitap verilemez.`,
      };
    }

    // 4. Kitap kopyasını barkod ile bul
    const copy = await this.uow.books.findCopyByBarcode(barcode);
    if (!copy) {
      return { success: false, message: `Barkod (${barcode}) sistemde bulunamadı.` };
    }

    // 5. State Pattern: Kopya durum geçişi
    try {
      copy.borrow();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Kopya ödünç verilebilir durumda değil.';
      return { success: false, message: errorMsg };
    }

    // 6. Teslim tarihi hesaplama (Üyelik tipine göre süre)
    const loanDurationDays = user.getDefaultLoanDurationDays();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDurationDays);

    const loanId = crypto.randomUUID();
    const newLoan = new Loan({
      id: loanId,
      userId: user.id,
      bookCopyId: copy.id,
      loanDate: new Date(),
      dueDate,
      status: LoanStatus.ACTIVE,
    });

    // 7. Kaydetme ve Güncelleme
    await this.uow.loans.save(newLoan);
    await this.uow.books.updateCopyStatus(copy.id, CopyStatus.BORROWED);

    // 8. Denetim Günlüğü (Audit Log)
    await this.uow.auditLogs.save(
      new AuditLog({
        userId: user.id,
        action: 'LOAN_BORROW',
        entityName: 'Loan',
        entityId: loanId,
        details: {
          barcode,
          dueDate: dueDate.toISOString(),
          userType: user.userType,
        },
      })
    );

    return {
      success: true,
      message: `Kitap başarıyla ödünç verildi. Son teslim tarihi: ${dueDate.toLocaleDateString('tr-TR')}`,
      loan: newLoan,
    };
  }

  /**
   * Kitap İade Alma İş Akışı
   */
  public async returnBook(barcode: string): Promise<IReturnResult> {
    // 1. Kopyayı barkoddan bul
    const copy = await this.uow.books.findCopyByBarcode(barcode);
    if (!copy) {
      return { success: false, message: `Barkod (${barcode}) sistemde bulunamadı.`, overdueDays: 0 };
    }

    // 2. Aktif ödünç kaydını bul
    const activeLoan = await this.uow.loans.findActiveLoanByCopyId(copy.id);
    if (!activeLoan) {
      return {
        success: false,
        message: 'Bu kitaba ait aktif bir ödünç kaydı bulunamadı.',
        overdueDays: 0,
      };
    }

    // 3. Kullanıcıyı ve ilgili ceza stratejisini bul
    const user = await this.uow.users.findById(activeLoan.userId);
    if (!user) {
      return { success: false, message: 'Kitabı ödünç alan kullanıcı bulunamadı.', overdueDays: 0 };
    }

    // 4. State Pattern: İade durum geçişi
    try {
      copy.returnCopy();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Kopya iade edilemez.';
      return { success: false, message: errorMsg, overdueDays: 0 };
    }

    // 5. Gecikme hesabı & Strategy Pattern
    const overdueDays = activeLoan.getOverdueDays();
    let calculatedFine: Fine | undefined = undefined;

    if (overdueDays > 0) {
      const fineStrategy = user.getFineStrategy();
      const fineAmount = fineStrategy.calculateFine(overdueDays);

      calculatedFine = new Fine({
        id: crypto.randomUUID(),
        loanId: activeLoan.id,
        userId: user.id,
        amount: fineAmount,
        isPaid: false,
      });

      await this.uow.fines.save(calculatedFine);
    }

    // 6. Ödünç kaydını tamamla
    activeLoan.markReturned(new Date());
    await this.uow.loans.update(activeLoan);
    await this.uow.books.updateCopyStatus(copy.id, CopyStatus.AVAILABLE);

    // 7. Kitap detayını bul (Observer event için)
    const book = await this.uow.books.findById(copy.bookId);
    const bookTitle = book?.title ?? 'Bilinmeyen Kitap';

    // 8. Observer Pattern: İade olayını ve rezervasyon kuyruğunu tetikle
    await this.deskSubject.notify({
      bookId: copy.bookId,
      bookCopyId: copy.id,
      barcode: copy.barcode,
      bookTitle,
      returnedAt: new Date(),
    });

    // 9. Audit Log
    await this.uow.auditLogs.save(
      new AuditLog({
        userId: user.id,
        action: 'LOAN_RETURN',
        entityName: 'Loan',
        entityId: activeLoan.id,
        details: {
          barcode,
          overdueDays,
          fineAmount: calculatedFine ? calculatedFine.amount : 0,
        },
      })
    );

    const message =
      overdueDays > 0 && calculatedFine
        ? `Kitap iade alındı. ${overdueDays} gün gecikme sebebiyle ${calculatedFine.amount.toFixed(2)} TL ceza tahakkuk ettirildi.`
        : 'Kitap zamanında ve sorunsuz şekilde iade alındı.';

    return {
      success: true,
      message,
      fine: calculatedFine,
      overdueDays,
    };
  }

  /**
   * Süre Uzatma (Extend Loan)
   */
  public async extendLoan(loanId: string): Promise<IExtendResult> {
    const loan = await this.uow.loans.findById(loanId);
    if (!loan) {
      return { success: false, message: 'Ödünç kaydı bulunamadı.' };
    }

    if (loan.status === LoanStatus.RETURNED) {
      return { success: false, message: 'İade edilmiş kitap için süre uzatılamaz.' };
    }

    // Gecikme kontrolü
    if (loan.isOverdue()) {
      return {
        success: false,
        message: 'Gecikmiş kitapların süresi uzatılamaz. Lütfen önce kütüphaneye teslim ediniz.',
      };
    }

    // Rezervasyon kontrolü: Kitaba başkası rezervasyon yaptıysa uzatılamaz
    const copy = await this.uow.books.findCopyById(loan.bookCopyId);
    if (copy) {
      const activeReservations = await this.uow.reservations.findActiveByBookId(copy.bookId);
      if (activeReservations.length > 0) {
        return {
          success: false,
          message: 'Bu kitap için sırada bekleyen rezervasyon olduğu için süre uzatılamaz.',
        };
      }
    }

    // 7 gün uzat
    loan.extendDueDate(7);
    await this.uow.loans.update(loan);

    return {
      success: true,
      message: `Ödünç süresi başarıyla 7 gün uzatıldı. Yeni teslim tarihi: ${loan.dueDate.toLocaleDateString('tr-TR')}`,
      newDueDate: loan.dueDate,
    };
  }
}
