/**
 * Kenya Tax & Deduction Calculation Service
 * Compliant with 2026 KRA rates and regulations
 */

export interface TaxCalculationInput {
  grossSalary: number;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  nssfContributionRate?: number;
  nhifContributionRate?: number;
  shilfContributionRate?: number;
  housingLevyRate?: number;
}

export interface TaxCalculationResult {
  grossSalary: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  paye: number;
  nssf: number;
  nhif: number;
  shilf: number;
  housingLevy: number;
  totalDeductions: number;
  netSalary: number;
  breakdown: {
    taxableIncome: number;
    taxBeforeRelief: number;
    personalRelief: number;
    taxAfterRelief: number;
  };
}

export class TaxCalculationService {
  // 2026 Tax brackets (Kenya Revenue Authority)
  private readonly TAX_BRACKETS = [
    { min: 0, max: 24000, rate: 0.1 },
    { min: 24000, max: 40800, rate: 0.15 },
    { min: 40800, max: 60000, rate: 0.2 },
    { min: 60000, max: 84000, rate: 0.25 },
    { min: 84000, Infinity, rate: 0.3 },
  ];

  // Personal relief (annual)
  private readonly PERSONAL_RELIEF_ANNUAL = 2400;
  private readonly PERSONAL_RELIEF_MONTHLY = this.PERSONAL_RELIEF_ANNUAL / 12;

  // Standard rates
  private readonly STANDARD_NSSF_RATE = 0.06; // 6%
  private readonly STANDARD_NHIF_RATE = 0.0175; // 1.75%
  private readonly STANDARD_SHILF_RATE = 0.005; // 0.5%
  private readonly STANDARD_HOUSING_LEVY_RATE = 0.015; // 1.5%

  /**
   * Calculate complete payroll deductions
   */
  calculateDeductions(input: TaxCalculationInput): TaxCalculationResult {
    // Use standard rates if not provided
    const nssfRate = input.nssfContributionRate || this.STANDARD_NSSF_RATE;
    const nhifRate = input.nhifContributionRate || this.STANDARD_NHIF_RATE;
    const shilfRate = input.shilfContributionRate || this.STANDARD_SHILF_RATE;
    const housingLevyRate = input.housingLevyRate || this.STANDARD_HOUSING_LEVY_RATE;

    // Calculate contributions
    const nssf = Math.round(input.basicSalary * nssfRate * 100) / 100;
    const nhif = Math.round(input.basicSalary * nhifRate * 100) / 100;
    const shilf = Math.round(input.basicSalary * shilfRate * 100) / 100;
    const housingLevy = Math.round(input.basicSalary * housingLevyRate * 100) / 100;

    // Calculate gross salary
    const allowances = input.allowances || 0;
    const grossSalary = input.basicSalary + allowances;

    // Taxable income = Gross - NSSF - Housing Levy
    const taxableIncome = grossSalary - nssf - housingLevy;

    // Calculate PAYE
    const paye = this.calculatePAYE(taxableIncome);

    // Calculate total deductions
    const totalDeductions = nssf + nhif + shilf + housingLevy + paye;

    // Net salary
    const netSalary = grossSalary - totalDeductions;

    return {
      grossSalary,
      basicSalary: input.basicSalary,
      allowances,
      deductions: input.deductions || 0,
      paye,
      nssf,
      nhif,
      shilf,
      housingLevy,
      totalDeductions,
      netSalary: Math.max(0, netSalary),
      breakdown: {
        taxableIncome,
        taxBeforeRelief: this.calculateTaxBeforeRelief(taxableIncome),
        personalRelief: this.PERSONAL_RELIEF_MONTHLY,
        taxAfterRelief: paye,
      },
    };
  }

  /**
   * Calculate PAYE (Personal Income Tax)
   */
  private calculatePAYE(taxableIncome: number): number {
    const taxBeforeRelief = this.calculateTaxBeforeRelief(taxableIncome);
    const taxAfterRelief = Math.max(0, taxBeforeRelief - this.PERSONAL_RELIEF_MONTHLY);
    return Math.round(taxAfterRelief * 100) / 100;
  }

  /**
   * Calculate tax before relief
   */
  private calculateTaxBeforeRelief(taxableIncome: number): number {
    let tax = 0;

    for (const bracket of this.TAX_BRACKETS) {
      if (taxableIncome > bracket.min) {
        const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        tax += incomeInBracket * bracket.rate;
      }
    }

    return tax;
  }

  /**
   * Calculate NSSF contribution
   * Rates vary by income level (2026 rates)
   */
  calculateNSSF(basicSalary: number): number {
    if (basicSalary <= 7000) {
      return basicSalary * 0.06;
    } else if (basicSalary <= 36000) {
      return basicSalary * 0.06;
    } else {
      // Capped at 36000
      return 36000 * 0.06;
    }
  }

  /**
   * Calculate NHIF contribution based on salary bands
   */
  calculateNHIF(basicSalary: number): number {
    const bands = [
      { max: 5999, contribution: 150 },
      { max: 7999, contribution: 300 },
      { max: 11999, contribution: 400 },
      { max: 14999, contribution: 500 },
      { max: 19999, contribution: 600 },
      { max: 24999, contribution: 750 },
      { max: 29999, contribution: 850 },
      { max: 34999, contribution: 900 },
      { max: 39999, contribution: 950 },
      { max: 44999, contribution: 1000 },
      { max: 49999, contribution: 1100 },
      { max: 59999, contribution: 1200 },
      { max: 69999, contribution: 1300 },
      { max: 79999, contribution: 1400 },
      { max: 89999, contribution: 1500 },
      { max: Infinity, contribution: 1600 },
    ];

    for (const band of bands) {
      if (basicSalary <= band.max) {
        return band.contribution;
      }
    }

    return 1600; // Maximum
  }

  /**
   * Validate tax calculation
   */
  validateCalculation(result: TaxCalculationResult): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (result.netSalary < 0) {
      errors.push("Net salary cannot be negative");
    }

    if (result.totalDeductions > result.grossSalary) {
      errors.push("Total deductions exceed gross salary");
    }

    if (result.paye < 0) {
      errors.push("PAYE cannot be negative");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate tax summary for employee
   */
  generateTaxSummary(
    basicSalary: number,
    allowances: number = 0,
    month: number,
    year: number
  ) {
    const result = this.calculateDeductions({
      basicSalary,
      allowances,
      grossSalary: basicSalary + allowances,
    });

    return {
      month,
      year,
      employee: {
        basicSalary,
        allowances,
      },
      earnings: {
        grossSalary: result.grossSalary,
        netSalary: result.netSalary,
      },
      deductions: {
        paye: result.paye,
        nssf: result.nssf,
        nhif: result.nhif,
        shilf: result.shilf,
        housingLevy: result.housingLevy,
        total: result.totalDeductions,
      },
      taxBreakdown: result.breakdown,
    };
  }
}

export const taxService = new TaxCalculationService();
