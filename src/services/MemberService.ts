import { User, UserFactory } from '../core/entities/User';
import { IUnitOfWork } from '../core/interfaces/IRepositories';
import { UserRole, UserType } from '../core/types/enums';

export interface ICreateUserInput {
  studentOrStaffId: string;
  fullName: string;
  email: string;
  role?: UserRole;
  userType: UserType;
  maxBorrowLimit?: number;
}

export interface IMemberSummary {
  user: User;
  activeLoanCount: number;
  unpaidFinesTotal: number;
  activeReservationsCount: number;
}

export class MemberService {
  private uow: IUnitOfWork;

  constructor(uow: IUnitOfWork) {
    this.uow = uow;
  }

  public async getMembers(search?: string): Promise<User[]> {
    return this.uow.users.findAll(search);
  }

  public async getMemberById(id: string): Promise<User | null> {
    return this.uow.users.findById(id);
  }

  public async getMemberByIdentifier(identifier: string): Promise<User | null> {
    let user = await this.uow.users.findById(identifier);
    if (!user) {
      user = await this.uow.users.findByStudentOrStaffId(identifier);
    }
    return user;
  }

  public async getMemberSummary(userId: string): Promise<IMemberSummary | null> {
    const user = await this.uow.users.findById(userId);
    if (!user) return null;

    const activeLoans = await this.uow.loans.findActiveLoansByUserId(userId);
    const unpaidFines = await this.uow.fines.findUnpaidFinesByUserId(userId);
    const reservations = await this.uow.reservations.findActiveByUserId(userId);

    const unpaidFinesTotal = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

    return {
      user,
      activeLoanCount: activeLoans.length,
      unpaidFinesTotal,
      activeReservationsCount: reservations.length,
    };
  }

  public async createMember(input: ICreateUserInput): Promise<User> {
    const existing = await this.uow.users.findByStudentOrStaffId(input.studentOrStaffId);
    if (existing) {
      throw new Error(`Bu kimlik/sicil numarasına (${input.studentOrStaffId}) sahip üye zaten kayıtlı.`);
    }

    const user = UserFactory.create({
      id: crypto.randomUUID(),
      studentOrStaffId: input.studentOrStaffId,
      fullName: input.fullName,
      email: input.email,
      role: input.role ?? UserRole.MEMBER,
      userType: input.userType,
      maxBorrowLimit: input.maxBorrowLimit,
    });

    return this.uow.users.save(user);
  }

  public async updateMember(id: string, input: Partial<ICreateUserInput>): Promise<User> {
    const existing = await this.uow.users.findById(id);
    if (!existing) {
      throw new Error('Üye bulunamadı.');
    }

    const updatedUser = UserFactory.create({
      id: existing.id,
      studentOrStaffId: input.studentOrStaffId ?? existing.studentOrStaffId,
      fullName: input.fullName ?? existing.fullName,
      email: input.email ?? existing.email,
      role: input.role ?? existing.role,
      userType: input.userType ?? existing.userType,
      maxBorrowLimit: input.maxBorrowLimit ?? existing.maxBorrowLimit,
      createdAt: existing.createdAt,
    });

    return this.uow.users.update(updatedUser);
  }

  public async deleteMember(id: string): Promise<void> {
    const user = await this.uow.users.findById(id);
    if (!user) throw new Error('Üye bulunamadı.');

    // 1. Aktif ödünç kontrolü
    const activeLoans = await this.uow.loans.findActiveLoansByUserId(id);
    if (activeLoans.length > 0) {
      throw new Error(
        `Bu üyenin üzerinde henüz teslim etmediği ${activeLoans.length} adet kitap bulunmaktadır. Üye kaydı silinemez.`
      );
    }

    // 2. Ödenmemiş borç kontrolü
    const unpaidFines = await this.uow.fines.findUnpaidFinesByUserId(id);
    const totalDebt = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    if (totalDebt > 0) {
      throw new Error(
        `Bu üyenin ${totalDebt.toFixed(2)} TL ödenmemiş gecikme cezası bulunmaktadır. Önce ceza tahsil edilmelidir.`
      );
    }

    await this.uow.users.delete(id);
  }
}
