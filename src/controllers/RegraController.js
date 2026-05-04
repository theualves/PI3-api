import { prisma } from "../lib/prisma.js";
import { toBoolean, sendValidationError } from "../utils/validation.js";
import { handleControllerError } from "../utils/apiErrors.js";

export const salvarRegra = async (req, res) => {
  const { exigeAprovacaoCoordenador, exigeCertificado } = req.body;
  const aprovacaoBool = toBoolean(exigeAprovacaoCoordenador);
  const certificadoBool = toBoolean(exigeCertificado);

  const validationErrors = [];
  if (exigeAprovacaoCoordenador !== undefined && aprovacaoBool === null) {
    validationErrors.push({
      field: "exigeAprovacaoCoordenador",
      message: "Informe true/false.",
    });
  }
  if (exigeCertificado !== undefined && certificadoBool === null) {
    validationErrors.push({
      field: "exigeCertificado",
      message: "Informe true/false.",
    });
  }
  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }

  try {
    const existente = await prisma.regra.findFirst({ select: { id: true } });

    const data = {};
    if (aprovacaoBool !== null) {
      data.exigeAprovacaoCoordenador = aprovacaoBool;
    }
    if (certificadoBool !== null) {
      data.exigeCertificado = certificadoBool;
    }
    if (Object.keys(data).length === 0) {
      data.exigeAprovacaoCoordenador = false;
      data.exigeCertificado = false;
    }

    const regra = existente
      ? await prisma.regra.update({
        where: { id: existente.id },
        data,
      })
      : await prisma.regra.create({ data });

    res.json(regra);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao salvar regra.");
  }
};

export const buscarRegra = async (req, res) => {
  try {
    const regra = await prisma.regra.findFirst();
    res.json(
      regra || {
        exigeAprovacaoCoordenador: false,
        exigeCertificado: false,
      }
    );
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar regra.");
  }
};