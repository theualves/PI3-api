import { prisma } from "../lib/prisma.js";

export const salvarRegra = async (req, res) => {
  const { verificaCoordenador, exigeCertificado, descricao } = req.body;

  try {
    const existente = await prisma.regra.findFirst({ select: { id: true } });
    const regra = existente
      ? await prisma.regra.update({
          where: { id: existente.id },
          data: {
            verificaCoordenador: Boolean(verificaCoordenador),
            exigeCertificado: Boolean(exigeCertificado),
            descricao: descricao || null,
          },
        })
      : await prisma.regra.create({
          data: {
            verificaCoordenador: Boolean(verificaCoordenador),
            exigeCertificado: Boolean(exigeCertificado),
            descricao: descricao || null,
          },
        });

    res.json(regra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar regra." });
  }
};

export const buscarRegra = async (req, res) => {
  try {
    const regra = await prisma.regra.findFirst();
    res.json(
      regra || {
        verificaCoordenador: false,
        exigeCertificado: false,
        descricao: null,
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar regra." });
  }
};