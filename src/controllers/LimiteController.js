import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const salvarLimite = async (req, res) => {
  const { maxHorasPorPeriodo, ensino, pesquisa, extensao } = req.body;

  try {
    const existente = await prisma.limite.findFirst();

    let limite;

    if (existente) {
      limite = await prisma.limite.update({
        where: { id: existente.id },
        data: {
          maxHorasPorPeriodo: parseInt(maxHorasPorPeriodo),
          ensino: parseInt(ensino),
          pesquisa: parseInt(pesquisa),
          extensao: parseInt(extensao)
        }
      });
    } else {
      limite = await prisma.limite.create({
        data: {
          maxHorasPorPeriodo: parseInt(maxHorasPorPeriodo),
          ensino: parseInt(ensino),
          pesquisa: parseInt(pesquisa),
          extensao: parseInt(extensao)
        }
      });
    }

    res.json(limite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar limite." });
  }
};

export const buscarLimite = async (req, res) => {
  try {
    const limite = await prisma.limite.findFirst();
    res.json(limite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar limite." });
  }
};