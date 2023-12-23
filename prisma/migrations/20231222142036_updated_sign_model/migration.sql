/*
  Warnings:

  - You are about to drop the column `description` on the `Sign` table. All the data in the column will be lost.
  - Added the required column `example` to the `Sign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sign" DROP COLUMN "description",
ADD COLUMN     "example" TEXT NOT NULL;
