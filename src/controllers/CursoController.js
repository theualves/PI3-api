import { prisma } from "../lib/prisma.js";
import { CURSOS_FILTRO, TURMAS_FILTRO, CATEGORIAS_FILTRO } from "../models/filtrosModel.js";

export const listarCursos = async (req, res) => {
  try {
    const { nome, categoria, tipoCurso, status } = req.query;
    const cursos = await prisma.curso.findMany({
      where: {
        nome: nome ? { contains: nome } : undefined,
        categoria: categoria ? { contains: categoria } : undefined,
        tipoCurso: tipoCurso ? { contains: tipoCurso } : undefined,
        status: status || undefined,
      },
      include: {
        usuarios: {
          where: { tipo: { in: ["COORDENADOR", "GESTOR"] } },
          select: { id: true, nome: true, email: true, tipo: true },
        },
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
  const { nome, categoria, tipoCurso, duracao, cargaHoraria, status } = req.body;
  try {
    const novoCurso = await prisma.curso.create({
      data: {
        nome,
        categoria,
        tipoCurso,
        duracao,
        cargaHoraria: Number(cargaHoraria),
        status: status || "Ativo",
      },
    });
    res.status(201).json(novoCurso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar curso no banco." });
  }
};

export const editarCurso = async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, tipoCurso, duracao, cargaHoraria, status } = req.body;
  try {
    const cursoAtualizado = await prisma.curso.update({
      where: { id },
      data: {
        nome,
        categoria,
        tipoCurso,
        duracao,
        cargaHoraria: cargaHoraria !== undefined ? Number(cargaHoraria) : undefined,
        status,
      },
    });
    res.json(cursoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao atualizar o curso. Verifique se o ID está correto.",
    });
  }
};

export const excluirCurso = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.curso.delete({ where: { id } });
    res.json({ message: "Curso excluído com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir o curso." });
  }
};

export const opcoesFiltros = async (_req, res) => {
  res.json({
    cursos: CURSOS_FILTRO,
    turmas: TURMAS_FILTRO,
    categorias: CATEGORIAS_FILTRO,
  });
};
