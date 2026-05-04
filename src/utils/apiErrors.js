import { Prisma } from "@prisma/client";

export const handleControllerError = (res, error, fallbackMessage) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Registro duplicado.",
        fields: Array.isArray(error.meta?.target) ? error.meta.target : undefined,
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Relacionamento inválido: verifique IDs enviados.",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Registro não encontrado.",
      });
    }

    if (error.code === "P2011" || error.code === "P2000") {
      return res.status(400).json({
        error: "Dados inválidos para operação no banco.",
      });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: "Dados inválidos para consulta/registro.",
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      error: "Banco indisponível no momento.",
    });
  }

  console.error(error);
  return res.status(500).json({ error: fallbackMessage });
};
