/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `usr` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "usr_username_key" ON "usr"("username");
