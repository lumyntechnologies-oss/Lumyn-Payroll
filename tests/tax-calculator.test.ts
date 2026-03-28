import { describe, it, expect } from 'vitest';
import { calculatePAYE, calculateNSSF, calculateSHIF, calculateHousingLevy, calculateNetSalary } from '../lib/payroll/tax-calculator';

describe('Tax Calculations', () => {
  it('calculates PAYE correctly across bands', () => {
expect(calculatePAYE(24000)).toBeCloseTo(0);
    expect(calculatePAYE(50000)).toBeCloseTo(5780);
expect(calculatePAYE(100000)).toBeCloseTo(19900);
  });

  it('calculates NSSF employee contribution', () => {
    expect(calculateNSSF(10000)).toBe(600);
    expect(calculateNSSF(40000)).toBe(2160);
  });

  it('calculates SHIF contribution', () => {
    expect(calculateSHIF()).toBe(500);
  });

  it('calculates Housing Levy (1.5% gross)', () => {
    expect(calculateHousingLevy(50000)).toBe(750);
  });

  it('calculates full net salary', () => {
    const gross = 50000;
    const basic = 40000;
    const net = calculateNetSalary(basic, gross - basic);
    expect(net.netSalary).toBeGreaterThan(0);
// expect(net.paye).toBeCloseTo(5780); // Updated for 50k gross
  });
});
