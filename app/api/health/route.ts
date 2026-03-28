import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // DB check
    await prisma.$queryRaw`SELECT 1`;
    
    // Redis check (if configured)
    // await redis.ping();
    
    // Compliance cron status (placeholder)
    const status = {
      db: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      payrollRuns: await prisma.payrollRun.count(),
      employees: await prisma.employee.count(),
    };

    return NextResponse.json({ 
      status: 'healthy',
      ...status 
    });
  } catch (error) {
    console.error('[Healthcheck] Failed:', error);
    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 503 }
    );
  }
}

