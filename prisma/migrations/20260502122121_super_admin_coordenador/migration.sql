/*
  Warnings:

  - You are about to drop the column `feedback` on the `atividade` table. All the data in the column will be lost.
  - You are about to drop the column `horas` on the `atividade` table. All the data in the column will be lost.
  - You are about to drop the column `metaHoras` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `qtdAlunos` on the `curso` table. All the data in the column will be lost.
  - You are about to drop the column `exigeAprovacaoCoordenador` on the `regra` table. All the data in the column will be lost.
  - You are about to drop the `_coordenadordocurso` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `Aluno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `Curso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cursoId,periodo]` on the table `Limite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpf` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horasSolicitadas` to the `Atividade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cargaHoraria` to the `Curso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoria` to the `Curso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duracao` to the `Curso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoCurso` to the `Curso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cursoId` to the `Limite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodo` to the `Limite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Regra` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_coordenadordocurso` DROP FOREIGN KEY `_CoordenadorDoCurso_A_fkey`;

-- DropForeignKey
ALTER TABLE `_coordenadordocurso` DROP FOREIGN KEY `_CoordenadorDoCurso_B_fkey`;

-- AlterTable
ALTER TABLE `aluno` ADD COLUMN `cpf` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `atividade` DROP COLUMN `feedback`,
    DROP COLUMN `horas`,
    ADD COLUMN `horasSolicitadas` INTEGER NOT NULL,
    ADD COLUMN `motivo` VARCHAR(191) NULL,
    ADD COLUMN `validadaEm` DATETIME(3) NULL,
    ADD COLUMN `validadaPorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `curso` DROP COLUMN `metaHoras`,
    DROP COLUMN `qtdAlunos`,
    ADD COLUMN `cargaHoraria` INTEGER NOT NULL,
    ADD COLUMN `categoria` VARCHAR(191) NOT NULL,
    ADD COLUMN `duracao` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipoCurso` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `limite` ADD COLUMN `cursoId` VARCHAR(191) NOT NULL,
    ADD COLUMN `periodo` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `regra` DROP COLUMN `exigeAprovacaoCoordenador`,
    ADD COLUMN `descricao` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `verificaCoordenador` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `usuario` MODIFY `tipo` ENUM('SUPER_ADMIN', 'COORDENADOR', 'GESTOR', 'ALUNO') NOT NULL;

-- DropTable
DROP TABLE `_coordenadordocurso`;

-- CreateIndex
CREATE UNIQUE INDEX `Aluno_cpf_key` ON `Aluno`(`cpf`);

-- CreateIndex
CREATE UNIQUE INDEX `Curso_nome_key` ON `Curso`(`nome`);

-- CreateIndex
CREATE UNIQUE INDEX `Limite_cursoId_periodo_key` ON `Limite`(`cursoId`, `periodo`);

-- AddForeignKey
ALTER TABLE `Atividade` ADD CONSTRAINT `Atividade_validadaPorId_fkey` FOREIGN KEY (`validadaPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Limite` ADD CONSTRAINT `Limite_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
