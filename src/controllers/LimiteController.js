import { prisma } from "../lib/prisma.js";
import { toInt, sendValidationError } from "../utils/validation.js";
import { handleControllerError } from "../utils/apiErrors.js";

export const salvarLimite = async (req, res) => {
  const { maxHorasPorPeriodo, ensino, pesquisa, extensao } = req.body;
  const maxHorasPorPeriodoInt = toInt(maxHorasPorPeriodo);
  const ensinoInt = toInt(ensino);
  const pesquisaInt = toInt(pesquisa);
  const extensaoInt = toInt(extensao);

  const validationErrors = [];
  if (maxHorasPorPeriodoInt === null || maxHorasPorPeriodoInt < 0) {
    validationErrors.push({
      field: "maxHorasPorPeriodo",
      message: "Informe um inteiro válido (>= 0).",
    });
  }
  if (ensinoInt === null || ensinoInt < 0) {
    validationErrors.push({
      field: "ensino",
      message: "Informe um inteiro válido (>= 0).",
    });
  }
  if (pesquisaInt === null || pesquisaInt < 0) {
    validationErrors.push({
      field: "pesquisa",
      message: "Informe um inteiro válido (>= 0).",
    });
  }
  if (extensaoInt === null || extensaoInt < 0) {
    validationErrors.push({
      field: "extensao",
      message: "Informe um inteiro válido (>= 0).",
    });
  }

  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }

  try {
    const existente = await prisma.limite.findFirst();

    let limite;

    if (existente) {
      limite = await prisma.limite.update({
        where: { id: existente.id },
        data: {
          maxHorasPorPeriodo: maxHorasPorPeriodoInt,
          ensino: ensinoInt,
          pesquisa: pesquisaInt,
          extensao: extensaoInt,
        },
      });
    } else {
      limite = await prisma.limite.create({
        data: {
          maxHorasPorPeriodo: maxHorasPorPeriodoInt,
          ensino: ensinoInt,
          pesquisa: pesquisaInt,
          extensao: extensaoInt,
        },
      });
    }

    res.json(limite);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao salvar limite.");
  }
};

export const buscarLimite = async (req, res) => {
  try {
    const limite = await prisma.limite.findFirst();
    res.json(limite || null);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar limite.");
  }
};