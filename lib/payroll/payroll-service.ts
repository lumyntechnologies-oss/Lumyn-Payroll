import prisma from '@/lib/prisma';
import { getCurrentDbUser } from '@/lib/auth';
import { calculatePAYE, calculateNSSF, calculateSHIF, calculateHousingLevy, calculateNetSalary } from './tax-calculator';
import { PayrollStatus } from '@/lib/generated/prisma';

export async function createPayrollRun(month: number, year: number) {
  // existing logic from route
}

export async function lockPayrollRun(id: string) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error('Unauthorized');

  const run = await prisma.payrollRun.findUnique({
    where: { id },
  });

  if (!run) throw new Error('Payroll run not found');
  if (run.status !== 'DRAFT') throw new Error('Can only lock DRAFT payrolls');
  if (run.lockedAt) throw new Error('Already locked');

  await prisma.payrollRun.update({
    where: { id },
    data: {
      lockedAt: new Date(),
      lockedBy: user.id,
    },
  });
}

export async function unlockPayrollRun(id: string) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.payrollRun.updateMany({
    where: { id, lockedBy: user.id },
    data: {
      lockedAt: null,
      lockedBy: null,
    },
  });
}

export async function isPayrollLocked(id: string) {
  const run = await prisma.payrollRun.findUnique({
    where: { id },
    select: { lockedAt: true },
  });
  return !!run?.lockedAt;
}

// Preview dry-run
export async function previewPayroll(month: number, year: number) {
  // calc preview without saving
}

