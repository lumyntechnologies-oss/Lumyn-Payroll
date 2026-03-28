import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { prisma } from "@/lib/prisma";
import { ComplianceType } from "@/lib/generated/prisma";

export interface ExportOptions {
  type: ComplianceType;
  year: number;
  month?: number;
  format: 'csv' | 'pdf';
}

export class ComplianceExportService {
  /**
   * Generate KRA PAYE export (iTax format)
   */
  static async exportKRA(year: number, month?: number): Promise<Buffer | string> {
    const where = { type: 'PAYE' };
    if (month !== undefined) Object.assign(where, { month });

    const payrollRun = await prisma.payrollRun.findFirst({
      where: { year },
    });
    const records = await prisma.payrollEntry.findMany({
      where: {
        payrollRunId: payrollRun?.id || undefined,
      },
      include: {
        employee: true,
      },
      orderBy: { employeeId: 'asc' },
    });


    const csvData = records.map((entry) => ({
      EmployeeID: entry.employee.employeeId,
      Name: `${entry.employee.firstName} ${entry.employee.lastName}`,
      Pin: entry.employee.kraPin,
      NationalID: entry.employee.nationalId,
      GrossSalary: entry.grossSalary.toFixed(2),
      PAYE: entry.paye.toFixed(2),
      Period: `${month?.toString().padStart(2, '0') || 'ANNUAL'}/${year}`,
    }));

    const csv = Papa.unparse(csvData);
    return csv;
  }

  /**
   * Generate NSSF employer/employee contribution export (ET1 format)
   */
  static async exportNSSF(year: number, month?: number): Promise<Buffer | string> {
    const where = { type: 'NSSF' };
    if (month !== undefined) Object.assign(where, { month });

    const records = await prisma.payrollEntry.findMany({
      where,
      year,
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            nssfNumber: true,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    const csvData = records.map((entry) => ({
      EmployerPIN: 'COMPANY_KRA_PIN', // From company profile
      EmployerName: 'Lumyn Ltd',
      EmployeeNSSF: entry.employee.nssfNumber || '',
      EmployeeName: `${entry.employee.firstName} ${entry.employee.lastName}`,
      EmployeeID: entry.employee.employeeId,
      BasicSalary: entry.basicSalary.toFixed(2),
      NSSFEmployee: entry.nssf.toFixed(2),
      NSSFEmpEmployer: (entry.nssf).toFixed(2), // 6% match
      Period: `${month?.toString().padStart(2, '0') || 'ANNUAL'}/${year}`,
    }));

    const csv = Papa.unparse(csvData);
    return csv;
  }

  /**
   * Generate PDF report for compliance
   */
  static generatePDFReport(csvData: string, title: string): Buffer {
    const doc = new jsPDF();
    
    doc.text(title, 14, 20);
    
    doc.autoTable({
      startY: 30,
      html: '#compliance-table', // If HTML table
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    return doc.output('arraybuffer') as Buffer;
  }

  /**
   * Main export method
   */
  static async exportCompliance(options: ExportOptions): Promise<{
    filename: string;
    data: Buffer | string;
    contentType: string;
  }> {
    let data: Buffer | string;
    let filename: string;
    let contentType: string;

    switch (options.type) {
      case 'PAYE':
        data = await this.exportKRA(options.year, options.month);
        filename = `KRA-iTax-${options.year}-${options.month || 'Annual'}.csv`;
        contentType = 'text/csv';
        break;
      case 'NSSF':
        data = await this.exportNSSF(options.year, options.month);
        filename = `NSSF-ET1-${options.year}-${options.month || 'Annual'}.csv`;
        contentType = 'text/csv';
        break;
      default:
        throw new Error(`Export not implemented for ${options.type}`);
    }

    return { filename, data, contentType };
  }
}

export const complianceExportService = ComplianceExportService;

