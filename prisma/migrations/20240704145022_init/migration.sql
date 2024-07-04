/*
  Warnings:

  - Added the required column `email_code` to the `putnik` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_putnik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "Password" TEXT NOT NULL,
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "broj_telefona" TEXT NOT NULL,
    "prebivaliste" TEXT NOT NULL,
    "email_ver" BOOLEAN NOT NULL DEFAULT false,
    "email_code" TEXT NOT NULL
);
INSERT INTO "new_putnik" ("Email", "Password", "broj_telefona", "id", "ime", "prebivaliste", "prezime") SELECT "Email", "Password", "broj_telefona", "id", "ime", "prebivaliste", "prezime" FROM "putnik";
DROP TABLE "putnik";
ALTER TABLE "new_putnik" RENAME TO "putnik";
CREATE UNIQUE INDEX "putnik_Email_key" ON "putnik"("Email");
CREATE UNIQUE INDEX "putnik_email_code_key" ON "putnik"("email_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
