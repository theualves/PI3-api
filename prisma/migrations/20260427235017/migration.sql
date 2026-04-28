/*
  Warnings:

  - You are about to drop the column `tipo` on the `curso` table. All the data in the column will be lost.
  - Added the required column `coordenador_responsavel` to the `Curso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qtdAlunos` to the `Curso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `curso` DROP COLUMN `tipo`,
    ADD COLUMN `coordenador_responsavel` VARCHAR(191) NOT NULL,
    ADD COLUMN `qtdAlunos` INTEGER NOT NULL;
