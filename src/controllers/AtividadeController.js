import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const criarAtividade = async (req, res) => {
  try {
    const atividade = await prisma.atividade.create({
      data: req.body
    });

    res.status(201).json(atividade);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

export const listarAtividades = async (req, res) => {
  const { cursoId, turma, categoria } = req.query;

  const atividades = await prisma.atividade.findMany({
    where: {
      categoria: categoria || undefined,
      aluno: {
        cursoId: cursoId || undefined,
        turma: turma || undefined
      }
    },
    include: {
      aluno: {
        include: {
          usuario: true
        }
      }
    }
  });

  res.json(atividades);
};

export const validarAtividade = async (req, res) => {
  const { id } = req.params;
  const { status, horasAprovadas, feedback } = req.body;

  const atividade = await prisma.atividade.update({
    where: { id },
    data: { status, horasAprovadas, feedback }
  });

  res.json(atividade);
};