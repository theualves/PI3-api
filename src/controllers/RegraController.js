import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const salvarRegra = async (req, res) => {
  const { exigeAprovacaoCoordenador, exigeCertificado } = req.body;

  try {
    const existente = await prisma.regra.findFirst();

    let regra;

    if (existente) {
      regra = await prisma.regra.update({
        where: { id: existente.id },
        data: {
          exigeAprovacaoCoordenador,
          exigeCertificado
        }
      });
    } else {
      regra = await prisma.regra.create({
        data: {
          exigeAprovacaoCoordenador,
          exigeCertificado
        }
      });
    }

    res.json(regra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar regra." });
  }
};

export const buscarRegra = async (req, res) => {
  try {
    const regra = await prisma.regra.findFirst();
    res.json(regra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar regra." });
  }
};