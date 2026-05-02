import { prisma } from "../lib/prisma.js";

export const salvarLimite = async (req, res) => {
  const { cursoId, periodo, maxHorasPorPeriodo, ensino, pesquisa, extensao } = req.body;

  try {
    const limite = await prisma.limite.upsert({
      where: {
        cursoId_periodo: {
          cursoId,
          periodo: Number(periodo),
        },
      },
      update: {
        maxHorasPorPeriodo: Number(maxHorasPorPeriodo),
        ensino: Number(ensino),
        pesquisa: Number(pesquisa),
        extensao: Number(extensao),
      },
      create: {
        cursoId,
        periodo: Number(periodo),
        maxHorasPorPeriodo: Number(maxHorasPorPeriodo),
        ensino: Number(ensino),
        pesquisa: Number(pesquisa),
        extensao: Number(extensao),
      },
      include: { curso: true },
    });

    res.json(limite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar limite." });
  }
};

export const buscarLimite = async (req, res) => {
  try {
    const { cursoId, periodo } = req.query;
    const limite = await prisma.limite.findMany({
      where: {
        cursoId: cursoId || undefined,
        periodo: periodo ? Number(periodo) : undefined,
      },
      include: { curso: true },
      orderBy: [{ periodo: "desc" }, { createdAt: "desc" }],
    });
    res.json(limite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar limite." });
  }
};