/**
 * Kenya Payroll Tax Calculator (2024 rates)
 * Sources: KRA PAYE bands, NSSF Act 2013, Housing Levy 1.5%
 */

interface TaxBreakdown {
  paye: number;
  nssf: number;
  shif: number; // SHIF (Successor to NHIF)
  housingLevy: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
}

export function calculatePAYE(monthlyGross: number): number {
  const annual = monthlyGross * 12;
  let tax = 0;
    const bands = [
    { upTo: 28800, rate: 0.10 },   // First KES 288,000 @ 10%
    { upTo: 38800, rate: 0.25 },   // Next KES 100,000 @ 25%
    { rate: 0.30 },                // Above KES 388,000 @ 30%
  ];
  
  let taxable = annual;
  for (const band of bands) {
    if (taxable <= 0) break;
    const bandLimit = band.upTo ? band.upTo * 12 : Infinity;
    const thisBand = Math.min(taxable, bandLimit);
    tax += thisBand * band.rate;
    taxable -= thisBand;
  }
  
  const annualRelief = 28800; // Annual personal relief
  return Math.max(0, (tax - annualRelief) / 12);
  return Math.max(0, tax / 12 - relief);
}

export function calculateNSSF(basicSalary: number): number {
  return Math.min(2160, basicSalary * 0.06); // Employee 6%, employer 6%, tiered cap
}

export function calculateSHIF(): number {
  return 500; // Provisional SHIF rate (NHIF successor)
}

export function calculateHousingLevy(grossSalary: number): number {
  return grossSalary * 0.015; // 1.5% Housing Levy
}

export function calculateNetSalary(
  basicSalary: number, 
  allowances = 0, 
  deductions = 0
): TaxBreakdown {
  const grossSalary = basicSalary + allowances;
  const paye = calculatePAYE(grossSalary);
  const nssf = calculateNSSF(basicSalary);
  const shif = calculateSHIF();
  const housingLevy = calculateHousingLevy(grossSalary);
  const totalDeductions = paye + nssf + shif + housingLevy + deductions;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    paye,
    nssf,
    shif,
    housingLevy,
    totalDeductions,
    grossSalary,
    netSalary,
  };
}
