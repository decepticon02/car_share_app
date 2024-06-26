-- CreateTable
CREATE TABLE "putnik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "broj_telefona" TEXT NOT NULL,
    "prebivaliste" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "usr" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "admin_check" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "voznja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usrId" INTEGER NOT NULL,
    "pocetna_destinacija" TEXT NOT NULL,
    "krajnja_destinacija" TEXT NOT NULL,
    "mesto_polaska" TEXT NOT NULL,
    "Broj_mesta" INTEGER NOT NULL,
    "Datum_i_vreme_polaska" DATETIME NOT NULL,
    "Cena" REAL NOT NULL,
    CONSTRAINT "voznja_usrId_fkey" FOREIGN KEY ("usrId") REFERENCES "usr" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "putnik_Email_key" ON "putnik"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "usr_Email_key" ON "usr"("Email");
