-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BANK', 'MPESA', 'INTERNATIONAL');

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "bankCode" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "mpesaNumber" TEXT,
    "swiftCode" TEXT,
    "iban" TEXT,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_employeeId_primary_key" ON "payment_methods"("employeeId", "primary");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
