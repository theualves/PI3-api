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
        coordenadores: {
          select: { id: true, nome: true, email: true, tipo: true, status: true },
        },
        usuarios: {
          select: { id: true, nome: true, email: true, tipo: true, status: true },
        },
      },
      include: {
        coordenadores: {
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
  const { nome, metaHoras, qtdAlunos, status, coordenadorIds } = req.body;

  const validationErrors = [];
  if (!isNonEmptyString(nome)) {
    validationErrors.push({ field: "nome", message: "Campo obrigatório." });
  }

  const metaHorasInt = toInt(metaHoras);
  if (metaHorasInt === null || metaHorasInt < 0) {
    validationErrors.push({
      field: "metaHoras",
      message: "Informe um número inteiro válido (>= 0).",
    });
  }

  const qtdAlunosInt = toInt(qtdAlunos);
  if (qtdAlunosInt === null || qtdAlunosInt < 0) {
    validationErrors.push({
      field: "qtdAlunos",
      message: "Informe um número inteiro válido (>= 0).",
    });
  }

  let coordenadorIdsNormalizado;
  if (coordenadorIds !== undefined) {
    coordenadorIdsNormalizado = toStringArray(coordenadorIds);
    if (coordenadorIdsNormalizado === null) {
      validationErrors.push({
        field: "coordenadorIds",
        message: "Envie um array de IDs de coordenadores.",
      });
    }
  }

  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }
  try {
    const novoCurso = await prisma.curso.create({
      data: {
        nome: nome.trim(),
        metaHoras: metaHorasInt,
        qtdAlunos: qtdAlunosInt,
        status: isNonEmptyString(status) ? status.trim() : "Ativo",
        coordenadores:
          coordenadorIdsNormalizado && coordenadorIdsNormalizado.length > 0
            ? {
                connect: coordenadorIdsNormalizado.map((id) => ({ id })),
              }
            : undefined,
      },
    });
    res.status(201).json(novoCurso);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao salvar curso no banco.");
  }
};

export const editarCurso = async (req, res) => {
  const { id } = req.params;
  const { nome, metaHoras, qtdAlunos, status, coordenadorIds } = req.body;

  if (!isNonEmptyString(id)) {
    return sendValidationError(res, [
      { field: "id", message: "ID do curso é obrigatório." },
    ]);
  }

  const data = {};
  const validationErrors = [];

  if (nome !== undefined) {
    if (!isNonEmptyString(nome)) {
      validationErrors.push({ field: "nome", message: "Campo inválido." });
    } else {
      data.nome = nome.trim();
    }
  }

  if (metaHoras !== undefined) {
    const parsed = toInt(metaHoras);
    if (parsed === null || parsed < 0) {
      validationErrors.push({
        field: "metaHoras",
        message: "Informe um inteiro válido (>= 0).",
      });
    } else {
      data.metaHoras = parsed;
    }
  }

  if (qtdAlunos !== undefined) {
    const parsed = toInt(qtdAlunos);
    if (parsed === null || parsed < 0) {
      validationErrors.push({
        field: "qtdAlunos",
        message: "Informe um inteiro válido (>= 0).",
      });
    } else {
      data.qtdAlunos = parsed;
    }
  }

  if (status !== undefined) {
    if (!isNonEmptyString(status)) {
      validationErrors.push({
        field: "status",
        message: "Informe um status válido.",
      });
    } else {
      data.status = status.trim();
    }
  }

  if (coordenadorIds !== undefined) {
    const ids = toStringArray(coordenadorIds);
    if (ids === null) {
      validationErrors.push({
        field: "coordenadorIds",
        message: "Envie um array de IDs de coordenadores.",
      });
    } else {
      data.coordenadores = { set: ids.map((coordenadorId) => ({ id: coordenadorId })) };
    }
  }

  if (Object.keys(data).length === 0) {
    validationErrors.push({
      field: "body",
      message: "Envie ao menos um campo para atualizar.",
    });
  }

  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }
  try {
    const cursoAtualizado = await prisma.curso.update({
      where: { id: id.trim() },
      data,
      include: {
        coordenadores: {
          select: { id: true, nome: true, email: true, tipo: true, status: true },
        },
      },
    });
    res.json(cursoAtualizado);
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Erro ao atualizar o curso. Verifique os dados enviados."
    );
  }
};

export const excluirCurso = async (req, res) => {
  const { id } = req.params;
  if (!isNonEmptyString(id)) {
    return sendValidationError(res, [
      { field: "id", message: "ID do curso é obrigatório." },
    ]);
  }

  try {
    await prisma.curso.delete({
      where: { id: id.trim() },
    });
    res.json({ message: "Curso excluído com sucesso!" });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao excluir o curso.");
  }
};
