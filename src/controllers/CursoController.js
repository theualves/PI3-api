import { prisma } from "../lib/prisma.js";
import {
  isNonEmptyString,
  toInt,
  toStringArray,
  sendValidationError,
} from "../utils/validation.js";
import { handleControllerError } from "../utils/apiErrors.js";

export const listarCursos = async (req, res) => {
  try {
    const { nome, status } = req.query;
    const cursos = await prisma.curso.findMany({
      where: {
        nome: isNonEmptyString(nome) ? { contains: nome.trim() } : undefined,
        status: isNonEmptyString(status) ? status.trim() : undefined,
      },
      include: {
        usuarios: {
          select: { id: true, nome: true, email: true, tipo: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(cursos);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar cursos.");
  }
};

export const criarCurso = async (req, res) => {
  const { nome, categoria, tipoCurso, duracao, cargaHoraria, status } = req.body;

  const validationErrors = [];
  if (!isNonEmptyString(nome)) {
    validationErrors.push({ field: "nome", message: "Nome é obrigatório." });
  }
  if (!isNonEmptyString(categoria)) {
    validationErrors.push({ field: "categoria", message: "Categoria é obrigatória." });
  }
  
  // Tratando cargaHoraria como a "Meta de Horas" do sistema
  const cargaHorariaInt = toInt(cargaHoraria);
  if (cargaHorariaInt === null || cargaHorariaInt < 0) {
    validationErrors.push({
      field: "cargaHoraria",
      message: "Informe a carga horária (meta de horas) válida.",
    });
  }

  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }

  try {
    const novoCurso = await prisma.curso.create({
      data: {
        nome: nome.trim(),
        categoria: isNonEmptyString(categoria) ? categoria.trim() : "Geral",
        tipoCurso: isNonEmptyString(tipoCurso) ? tipoCurso.trim() : "Bacharelado",
        duracao: isNonEmptyString(duracao) ? duracao.trim() : "N/A",
        cargaHoraria: cargaHorariaInt,
        status: isNonEmptyString(status) ? status.trim() : "Ativo",
      },
    });
    res.status(201).json(novoCurso);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao salvar curso. Verifique se o nome já existe.");
  }
};

export const editarCurso = async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, tipoCurso, duracao, cargaHoraria, status } = req.body;

  if (!isNonEmptyString(id)) {
    return sendValidationError(res, [{ field: "id", message: "ID obrigatório." }]);
  }

  const data = {};
  if (nome) data.nome = nome.trim();
  if (categoria) data.categoria = categoria.trim();
  if (tipoCurso) data.tipoCurso = tipoCurso.trim();
  if (duracao) data.duracao = duracao.trim();
  if (cargaHoraria) data.cargaHoraria = toInt(cargaHoraria);
  if (status) data.status = status.trim();

  try {
    const cursoAtualizado = await prisma.curso.update({
      where: { id: id.trim() },
      data,
    });
    res.json(cursoAtualizado);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao atualizar o curso.");
  }
};

export const excluirCurso = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.curso.delete({ where: { id: id.trim() } });
    res.json({ message: "Curso excluído com sucesso!" });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao excluir o curso.");
  }
};

export const opcoesFiltros = async (req, res) => {
  res.json({ status: ["Ativo", "Inativo"], tipos: ["Superior", "Técnico", "Extensão"] });
};
