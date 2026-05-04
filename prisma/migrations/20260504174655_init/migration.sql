-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpira` DATETIME(3) NULL;
