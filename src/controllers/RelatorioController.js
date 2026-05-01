import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const gerarRelatorio = async (req, res) => {
  const { cursoId, periodo, categoria } = req.query;

  const dados = await prisma.atividade.findMany({
    where: {
      status: 'APROVADA',
      categoria: categoria || undefined,
      aluno: {
        cursoId: cursoId || undefined,
        periodo: periodo ? Number(periodo) : undefined
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

  res.json(dados);
};