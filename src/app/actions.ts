'use server';

import { revalidatePath } from 'next/cache';
import { UserRole, UserType } from '../core/types/enums';
import { SupabaseUnitOfWork } from '../infrastructure/repositories/SupabaseUnitOfWork';
import { CatalogService, ICreateBookInput } from '../services/CatalogService';
import { CirculationService } from '../services/CirculationService';
import { DashboardService } from '../services/DashboardService';
import { FineCalculatorService } from '../services/FineCalculatorService';
import { ICreateUserInput, MemberService } from '../services/MemberService';

const uow = SupabaseUnitOfWork.getInstance();
const circulationService = new CirculationService(uow);
const catalogService = new CatalogService(uow);
const memberService = new MemberService(uow);
const fineService = new FineCalculatorService(uow);
const dashboardService = new DashboardService(uow);

/**
 * Kitap Ödünç Verme Action
 */
export async function borrowBookAction(userIdOrNo: string, barcode: string) {
  try {
    const result = await circulationService.borrowBook(userIdOrNo, barcode);
    revalidatePath('/');
    revalidatePath('/circulation');
    revalidatePath('/catalog');
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ödünç verme sırasında hata oluştu.';
    return { success: false, message };
  }
}

/**
 * Kitap İade Alma Action
 */
export async function returnBookAction(barcode: string) {
  try {
    const result = await circulationService.returnBook(barcode);
    revalidatePath('/');
    revalidatePath('/circulation');
    revalidatePath('/catalog');
    revalidatePath('/fines');
    return {
      success: result.success,
      message: result.message,
      overdueDays: result.overdueDays,
      fineAmount: result.fine ? result.fine.amount : 0,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'İade alma sırasında hata oluştu.';
    return { success: false, message, overdueDays: 0, fineAmount: 0 };
  }
}

/**
 * Süre Uzatma Action
 */
export async function extendLoanAction(loanId: string) {
  try {
    const result = await circulationService.extendLoan(loanId);
    revalidatePath('/circulation');
    return {
      success: result.success,
      message: result.message,
      newDueDate: result.newDueDate?.toLocaleDateString('tr-TR'),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Süre uzatılamadı.';
    return { success: false, message };
  }
}

/**
 * Ceza Tahsil Etme Action
 */
export async function payFineAction(fineId: string) {
  try {
    const fine = await fineService.payFine(fineId);
    revalidatePath('/');
    revalidatePath('/fines');
    revalidatePath('/members');
    return {
      success: true,
      message: `${fine.amount.toFixed(2)} TL ceza tutarı tahsil edildi ve üye kısıtlaması kaldırıldı.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ceza tahsil edilemedi.';
    return { success: false, message };
  }
}

/**
 * Yeni Kitap Ekleme Action
 */
export async function createBookAction(data: {
  isbn: string;
  title: string;
  categoryId?: number;
  publisher: string;
  publishYear: number;
  pageCount: number;
  description?: string;
  authorIds?: number[];
  initialCopiesCount?: number;
}) {
  try {
    const input: ICreateBookInput = {
      ...data,
      initialCopiesCount: data.initialCopiesCount ?? 1,
    };
    const book = await catalogService.createBook(input);
    revalidatePath('/catalog');
    revalidatePath('/');
    return {
      success: true,
      message: `"${book.title}" başlıklı kitap ve kopyaları envantere eklendi.`,
      bookId: book.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kitap eklenemedi.';
    return { success: false, message };
  }
}

/**
 * Yeni Üye Ekleme Action
 */
export async function createMemberAction(data: {
  studentOrStaffId: string;
  fullName: string;
  email: string;
  role?: UserRole;
  userType: UserType;
  maxBorrowLimit?: number;
}) {
  try {
    const input: ICreateUserInput = {
      ...data,
      role: data.role ?? UserRole.MEMBER,
    };
    const member = await memberService.createMember(input);
    revalidatePath('/members');
    revalidatePath('/');
    return {
      success: true,
      message: `${member.fullName} (${member.studentOrStaffId}) adlı üye başarıyla kaydedildi.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Üye eklenemedi.';
    return { success: false, message };
  }
}

/**
 * Kitap Güncelleme Action
 */
export async function updateBookAction(id: string, data: Partial<ICreateBookInput>) {
  try {
    const book = await catalogService.updateBook(id, data);
    revalidatePath('/catalog');
    revalidatePath('/');
    return {
      success: true,
      message: `"${book.title}" başlıklı kitap başarıyla güncellendi.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kitap güncellenemedi.';
    return { success: false, message };
  }
}

/**
 * Kitap Silme Action
 */
export async function deleteBookAction(id: string) {
  try {
    await catalogService.deleteBook(id);
    revalidatePath('/catalog');
    revalidatePath('/');
    return {
      success: true,
      message: 'Kitap ve kopyaları envanterden silindi.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kitap silinemedi.';
    return { success: false, message };
  }
}

/**
 * Yeni Kopya Ekleme Action
 */
export async function addCopyAction(bookId: string, barcode: string, shelfLocation: string) {
  try {
    const copy = await catalogService.addCopy(bookId, barcode, shelfLocation);
    revalidatePath('/catalog');
    return {
      success: true,
      message: `Yeni kopya (${copy.barcode}) rafa eklendi.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kopya eklenemedi.';
    return { success: false, message };
  }
}

/**
 * Kopya Silme Action
 */
export async function deleteCopyAction(copyId: string) {
  try {
    await catalogService.deleteCopy(copyId);
    revalidatePath('/catalog');
    return {
      success: true,
      message: 'Fiziksel kopya envanterden çıkarıldı.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kopya silinemedi.';
    return { success: false, message };
  }
}

/**
 * Kopya Bakım Durumu Değiştirme (State Pattern)
 */
export async function toggleCopyMaintenanceAction(barcode: string, currentStatus: string) {
  try {
    if (currentStatus === 'MAINTENANCE') {
      await catalogService.restoreCopy(barcode);
    } else {
      await catalogService.setCopyMaintenance(barcode);
    }
    revalidatePath('/catalog');
    return {
      success: true,
      message: `Kopya (${barcode}) durumu güncellendi.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Durum güncellenemedi.';
    return { success: false, message };
  }
}

/**
 * Üye Güncelleme Action
 */
export async function updateMemberAction(id: string, data: Partial<ICreateUserInput>) {
  try {
    const member = await memberService.updateMember(id, data);
    revalidatePath('/members');
    revalidatePath('/');
    return {
      success: true,
      message: `${member.fullName} adlı üyenin bilgileri güncellendi.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Üye güncellenemedi.';
    return { success: false, message };
  }
}

/**
 * Üye Silme Action
 */
export async function deleteMemberAction(id: string) {
  try {
    await memberService.deleteMember(id);
    revalidatePath('/members');
    revalidatePath('/');
    return {
      success: true,
      message: 'Üye kaydı başarıyla silindi.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Üye silinemedi.';
    return { success: false, message };
  }
}

/**
 * Dashboard Verilerini Getirme
 */
export async function getDashboardDataAction() {
  const stats = await dashboardService.getStats();
  return stats;
}

/**
 * Aktif Ödünçleri Getirme
 */
export async function getCirculationDataAction() {
  const loans = await uow.loans.findAll();
  const detailedLoans = [];

  for (const loan of loans) {
    const user = await uow.users.findById(loan.userId);
    const copy = await uow.books.findCopyById(loan.bookCopyId);
    let bookTitle = 'Bilinmeyen Kitap';
    if (copy) {
      const book = await uow.books.findById(copy.bookId);
      if (book) bookTitle = book.title;
    }

    detailedLoans.push({
      id: loan.id,
      userName: user?.fullName ?? 'Bilinmeyen Üye',
      userType: user?.userType ?? UserType.STANDARD,
      studentOrStaffId: user?.studentOrStaffId ?? '-',
      barcode: copy?.barcode ?? '-',
      bookTitle,
      loanDate: loan.loanDate.toLocaleDateString('tr-TR'),
      dueDate: loan.dueDate.toLocaleDateString('tr-TR'),
      isOverdue: loan.isOverdue(),
      overdueDays: loan.getOverdueDays(),
      status: loan.status,
    });
  }

  return detailedLoans;
}
