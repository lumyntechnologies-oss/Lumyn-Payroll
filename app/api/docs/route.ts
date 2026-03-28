import { NextResponse } from "next/server";

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Lumyn Payroll API",
    version: "1.0.0",
    description: "Production-ready payroll management system API for Kenyan businesses",
    contact: {
      name: "Lumyn Support",
      email: "joshua@lumyn.co.ke",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/api/employees": {
      get: {
        summary: "List employees",
        tags: ["Employees"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "departmentId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "List of employees" },
        },
      },
      post: {
        summary: "Create employee",
        tags: ["Employees"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["firstName", "lastName", "email", "employeeId", "departmentId", "jobTitle", "basicSalary", "hireDate"],
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string", format: "email" },
                  employeeId: { type: "string" },
                  departmentId: { type: "string" },
                  jobTitle: { type: "string" },
                  basicSalary: { type: "number" },
                  hireDate: { type: "string", format: "date" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Employee created" },
        },
      },
    },
    "/api/employees/{id}": {
      get: {
        summary: "Get employee by ID",
        tags: ["Employees"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Employee details" },
        },
      },
      put: {
        summary: "Update employee",
        tags: ["Employees"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        responses: {
          "200": { description: "Employee updated" },
        },
      },
      delete: {
        summary: "Delete employee",
        tags: ["Employees"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Employee deleted" },
        },
      },
    },
    "/api/payroll/runs": {
      get: {
        summary: "List payroll runs",
        tags: ["Payroll"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "APPROVED", "DISBURSED"] } },
        ],
        responses: {
          "200": { description: "List of payroll runs" },
        },
      },
      post: {
        summary: "Create payroll run",
        tags: ["Payroll"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["month", "year"],
                properties: {
                  month: { type: "integer", minimum: 1, maximum: 12 },
                  year: { type: "integer", minimum: 2000, maximum: 2100 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Payroll run created" },
        },
      },
    },
    "/api/payroll/disburse": {
      post: {
        summary: "Disburse payroll",
        tags: ["Payroll"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["payrollRunId"],
                properties: {
                  payrollRunId: { type: "string" },
                  entryIds: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Payroll disbursed" },
        },
      },
    },
    "/api/attendance/clock-in": {
      post: {
        summary: "Clock in",
        tags: ["Attendance"],
        responses: {
          "200": { description: "Clocked in successfully" },
        },
      },
    },
    "/api/attendance/clock-out": {
      post: {
        summary: "Clock out",
        tags: ["Attendance"],
        responses: {
          "200": { description: "Clocked out successfully" },
        },
      },
    },
    "/api/leave/requests": {
      get: {
        summary: "List leave requests",
        tags: ["Leave"],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] } },
        ],
        responses: {
          "200": { description: "List of leave requests" },
        },
      },
      post: {
        summary: "Create leave request",
        tags: ["Leave"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["leaveTypeId", "startDate", "endDate", "days"],
                properties: {
                  leaveTypeId: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" },
                  days: { type: "integer" },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Leave request created" },
        },
      },
    },
    "/api/wallet/balance": {
      get: {
        summary: "Get wallet balance",
        tags: ["Wallet"],
        responses: {
          "200": { description: "Wallet balance" },
        },
      },
    },
    "/api/wallet/topup": {
      post: {
        summary: "Top up wallet",
        tags: ["Wallet"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount"],
                properties: {
                  amount: { type: "number", minimum: 100, maximum: 1000000 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Top up initiated" },
        },
      },
    },
    "/api/reports": {
      get: {
        summary: "List reports",
        tags: ["Reports"],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          "200": { description: "List of reports" },
        },
      },
      post: {
        summary: "Generate report",
        tags: ["Reports"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type"],
                properties: {
                  type: { type: "string", enum: ["Employee Roster", "Payslip Batch", "Compliance Report", "Attendance Report"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Report generated" },
        },
      },
    },
  },
  tags: [
    { name: "Employees", description: "Employee management" },
    { name: "Payroll", description: "Payroll processing" },
    { name: "Attendance", description: "Attendance tracking" },
    { name: "Leave", description: "Leave management" },
    { name: "Wallet", description: "Wallet operations" },
    { name: "Reports", description: "Reporting" },
  ],
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}
