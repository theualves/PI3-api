import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const listarCursos = async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      orderBy: { createdAt: 'desc' } 
    });
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cursos." });
  }
};

export const criarCurso = async (req, res) => {
  const { nome, coordenador_responsavel , metaHoras, qtdAlunos, status} = req.body;
  try {
    const novoCurso = await prisma.curso.create({
      data: {
        nome,
        coordenador_responsavel,
        metaHoras: parseInt(metaHoras),
        qtdAlunos: parseInt(qtdAlunos),
        status: status || "Ativo"
      },
    });
    res.status(201).json(novoCurso);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "Erro ao salvar no banco." });
  }
};