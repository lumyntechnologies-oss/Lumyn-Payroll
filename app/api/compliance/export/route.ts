import { NextRequest, NextResponse } from 'next/server';
import { complianceExportService, ExportOptions } from '@/lib/compliance/export-service';
import { getCurrentDbUser } from '@/lib/auth';
import { requireRole } from '@/lib/auth';
import { Roles } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const user = await requireRole([Roles.FINANCE, Roles.HR_ADMIN, Roles.SUPER_ADMIN]);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as any;
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'pdf';

    if (!type || !year || !['PAYE', 'NSSF'].includes(type)) {
      return NextResponse.json({ error: 'Missing/invalid type or year' }, { status: 400 });
    }

    const options: ExportOptions = { 
      type, 
      year, 
      month: month || undefined, 
      format 
    };

    const result = await complianceExportService.exportCompliance(options);

    // Set headers for download
    const headers = new Headers();
    headers.set('Content-Type', result.contentType);
    headers.set('Content-Disposition', `attachment; filename="${result.filename}"`);

    return new NextResponse(result.data as string, { 
      headers,
      status: 200 
    });
  } catch (error) {
    console.error('[Compliance Export] Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

