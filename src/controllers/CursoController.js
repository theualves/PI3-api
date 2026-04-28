import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const listarCursos = async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        coordenador: true, // Isso faz o JOIN com a tabela Usuario
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cursos." });
  }
};

export const criarCurso = async (req, res) => {
  const { nome, metaHoras, qtdAlunos, status, coordenadorId } = req.body;
  try {
    const novoCurso = await prisma.curso.create({
      data: {
        nome,
        metaHoras: parseInt(metaHoras),
        qtdAlunos: parseInt(qtdAlunos),
        status: status || "Ativo",
        coordenadorId: coordenadorId || null,
      },
    });
    res.status(201).json(novoCurso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar no banco." });
  }
};

export const editarCurso = async (req, res) => {
  const { id } = req.params;
  const { nome, metaHoras, qtdAlunos, status, coordenadorId } = req.body;
  try {
    const cursoAtualizado = await prisma.curso.update({
      where: { id: id },
      data: {
        nome,
        metaHoras: metaHoras ? parseInt(metaHoras) : undefined,
        qtdAlunos: qtdAlunos ? parseInt(qtdAlunos) : undefined,
        status,
        coordenadorId: coordenadorId !== undefined ? coordenadorId : undefined,
      },
    });
    res.json(cursoAtualizado);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        error: "Erro ao atualizar o curso. Verifique se o ID está correto.",
      });
  }
};

export const excluirCurso = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.curso.delete({
      where: { id: id },
    });
    res.json({ message: "Curso excluído com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao excluir o curso." });
  }
};
