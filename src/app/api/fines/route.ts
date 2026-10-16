import { NextResponse } from 'next/server';
import { SupabaseUnitOfWork } from '@/infrastructure/repositories/SupabaseUnitOfWork';
import { FineCalculatorService } from '@/services/FineCalculatorService';

export async function GET() {
  const uow = SupabaseUnitOfWork.getInstance();
  const fineService = new FineCalculatorService(uow);
  const data = await fineService.getFines();

  const formatted = data.map((item) => ({
    id: item.fine.id,
    userName: item.userName,
    userType: item.userType,
    studentOrStaffId: item.studentOrStaffId,
    amount: item.fine.amount,
    isPaid: item.fine.isPaid,
    calculatedAt: item.fine.calculatedAt.toISOString(),
    paidAt: item.fine.paidAt ? item.fine.paidAt.toISOString() : null,
  }));

  return NextResponse.json(formatted);
}
