import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/placeholder",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const depts = await Promise.all([
    prisma.department.upsert({ where: { name: "Engineering" }, update: {}, create: { name: "Engineering", description: "Software Engineering" } }),
    prisma.department.upsert({ where: { name: "Sales" }, update: {}, create: { name: "Sales", description: "Sales & Business Development" } }),
    prisma.department.upsert({ where: { name: "HR" }, update: {}, create: { name: "HR", description: "Human Resources" } }),
    prisma.department.upsert({ where: { name: "Finance" }, update: {}, create: { name: "Finance", description: "Finance & Accounting" } }),
    prisma.department.upsert({ where: { name: "Operations" }, update: {}, create: { name: "Operations", description: "Business Operations" } }),
    prisma.department.upsert({ where: { name: "Marketing" }, update: {}, create: { name: "Marketing", description: "Marketing & Brand" } }),
  ]);

  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({ where: { name: "Annual Leave" }, update: {}, create: { name: "Annual Leave", totalDays: 21 } }),
    prisma.leaveType.upsert({ where: { name: "Sick Leave" }, update: {}, create: { name: "Sick Leave", totalDays: 10 } }),
    prisma.leaveType.upsert({ where: { name: "Maternity Leave" }, update: {}, create: { name: "Maternity Leave", totalDays: 90 } }),
    prisma.leaveType.upsert({ where: { name: "Paternity Leave" }, update: {}, create: { name: "Paternity Leave", totalDays: 14 } }),
    prisma.leaveType.upsert({ where: { name: "Unpaid Leave" }, update: {}, create: { name: "Unpaid Leave", totalDays: 30 } }),
  ]);

  const employeesData = [
    { firstName: "Alice", lastName: "Nyambura", email: "alice@lumyn.co.ke", phone: "+254701000001", dept: "Engineering", title: "Software Engineer", salary: 120000 },
    { firstName: "David", lastName: "Mwangi", email: "david@lumyn.co.ke", phone: "+254701000002", dept: "Sales", title: "Sales Executive", salary: 85000 },
    { firstName: "Sarah", lastName: "Wanjiku", email: "sarah@lumyn.co.ke", phone: "+254701000003", dept: "HR", title: "HR Officer", salary: 75000 },
    { firstName: "James", lastName: "Otieno", email: "james@lumyn.co.ke", phone: "+254701000004", dept: "Finance", title: "Accountant", salary: 95000 },
    { firstName: "Grace", lastName: "Achieng", email: "grace@lumyn.co.ke", phone: "+254701000005", dept: "Operations", title: "Operations Coordinator", salary: 65000 },
    { firstName: "Peter", lastName: "Kamau", email: "peter@lumyn.co.ke", phone: "+254701000006", dept: "Engineering", title: "DevOps Engineer", salary: 130000 },
    { firstName: "Mary", lastName: "Gathoni", email: "mary@lumyn.co.ke", phone: "+254701000007", dept: "Marketing", title: "Marketing Analyst", salary: 70000 },
    { firstName: "John", lastName: "Njoroge", email: "john@lumyn.co.ke", phone: "+254701000008", dept: "Sales", title: "Sales Manager", salary: 110000 },
  ];

  const employees = [];
  for (let i = 0; i < employeesData.length; i++) {
    const ed = employeesData[i];
    const dept = depts.find(d => d.name === ed.dept)!;
    const emp = await prisma.employee.upsert({
      where: { email: ed.email },
      update: {},
      create: {
        employeeId: `EMP${String(i + 1).padStart(3, "0")}`,
        firstName: ed.firstName,
        lastName: ed.lastName,
        email: ed.email,
        phone: ed.phone,
        departmentId: dept.id,
        jobTitle: ed.title,
        employmentType: "FULL_TIME",
        hireDate: new Date("2022-01-01"),
        status: "ACTIVE",
        basicSalary: ed.salary,
      },
    });
    employees.push(emp);

    for (const lt of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: emp.id, leaveTypeId: lt.id, year: 2026 } },
        update: {},
        create: { employeeId: emp.id, leaveTypeId: lt.id, year: 2026, total: lt.totalDays, used: 0, remaining: lt.totalDays },
      });
    }
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const existingRun = await prisma.payrollRun.findUnique({ where: { month_year: { month, year } } });
  if (!existingRun) {
    const entries = employees.map(emp => {
      const basic = emp.basicSalary;
      const allowances = basic * 0.2;
      const grossSalary = basic + allowances;
      const paye = Math.max(0, (grossSalary * 12 * 0.25 - 28800) / 12);
      const nssf = Math.min(2160, basic * 0.06);
      const shif = 500;
      const housingLevy = grossSalary * 0.015;
      const netSalary = grossSalary - paye - nssf - shif - housingLevy;
      return { employeeId: emp.id, basicSalary: basic, allowances, deductions: 0, paye, nssf, shif, housingLevy, grossSalary, netSalary };
    });
    const totalGross = entries.reduce((s, e) => s + e.grossSalary, 0);
    const totalTax = entries.reduce((s, e) => s + e.paye + e.nssf + e.shif + e.housingLevy, 0);
    const totalNet = entries.reduce((s, e) => s + e.netSalary, 0);

    const run = await prisma.payrollRun.create({ data: { month, year, status: "DRAFT", totalGross, totalTax, totalNet } });
    await prisma.payrollEntry.createMany({ data: entries.map(e => ({ ...e, payrollRunId: run.id })) });
  }

  await Promise.all([
    prisma.complianceRecord.upsert({ where: { type_month_year: { type: "PAYE", month, year } }, update: {}, create: { type: "PAYE", month, year, amount: 892400, dueDate: new Date(`${year}-${String(month)}-20`), status: "PENDING" } }),
    prisma.complianceRecord.upsert({ where: { type_month_year: { type: "NSSF", month, year } }, update: {}, create: { type: "NSSF", month, year, amount: 371520, dueDate: new Date(`${year}-${String(month)}-15`), status: "DUE_SOON" } }),
    prisma.complianceRecord.upsert({ where: { type_month_year: { type: "SHIF", month, year } }, update: {}, create: { type: "SHIF", month, year, amount: 86000, dueDate: new Date(`${year}-${String(month)}-15`), status: "DUE_SOON" } }),
    prisma.complianceRecord.upsert({ where: { type_month_year: { type: "HOUSING_LEVY", month, year } }, update: {}, create: { type: "HOUSING_LEVY", month, year, amount: 244080, dueDate: new Date(`${year}-${String(month)}-20`), status: "PENDING" } }),
  ]);

  await Promise.all([
    prisma.notification.create({ data: { title: "NSSF Filing Due Soon", message: "NSSF remittance is due in 2 days. Ensure timely payment to avoid penalties.", type: "WARNING" } }),
    prisma.notification.create({ data: { title: "Payroll Ready for Review", message: `March ${year} payroll has been generated and is ready for approval.`, type: "INFO" } }),
    prisma.notification.create({ data: { title: "New Leave Request", message: "Alice Nyambura has submitted an annual leave request.", type: "INFO" } }),
  ]);

  console.log("Seeding complete!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
