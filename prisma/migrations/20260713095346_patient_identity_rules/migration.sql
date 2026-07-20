-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "isTemporary" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "patients_clinicId_cnic_idx" ON "patients"("clinicId", "cnic");
