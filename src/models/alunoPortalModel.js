import { prisma } from "../lib/prisma.js";

export const LIMITE_HORAS_PADRAO = 100;
export const STATUS_EDITAVEIS = new Set(["PENDENTE", "REJEITADA"]);

const AVISOS_STATUS = {
  APROVADA: "Sua atividade foi aprovada.",
  REJEITADA: "Sua atividade foi rejeitada.",
  PENDENTE: "Sua atividade está em análise.",
};

export const buscarAlunoPorId = (alunoId) =>
  prisma.aluno.findUnique({
    where: { id: alunoId },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true },
      },
      curso: true,
    },
  });

export const buscarDadosDashboardAluno = async (alunoId, limiteHoras = LIMITE_HORAS_PADRAO) => {
  const [resumoPorStatus, atualizacoesRecentes] = await prisma.$transaction([
    prisma.atividade.groupBy({
      by: ["status"],
      where: { alunoId },
      _sum: {
        horasSolicitadas: true,
        horasAprovadas: true,
      },
    }),
    prisma.atividade.findMany({
      where: { alunoId },
      orderBy: [{ validadaEm: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        titulo: true,
        status: true,
        motivo: true,
        validadaEm: true,
        createdAt: true,
      },
    }),
  ]);

  const cards = {
    horasAprovadas: 0,
    horasEmAnalise: 0,
    horasRejeitadas: 0,
  };

  for (const linha of resumoPorStatus) {
    if (linha.status === "APROVADA") {
      cards.horasAprovadas += linha._sum.horasAprovadas || 0;
      continue;
    }

    if (linha.status === "PENDENTE") {
      cards.horasEmAnalise += linha._sum.horasSolicitadas || 0;
      continue;
    }

    if (linha.status === "REJEITADA") {
      cards.horasRejeitadas += linha._sum.horasSolicitadas || 0;
    }
  }

  const percentualProgresso =
    limiteHoras > 0 ? Math.min(Number(((cards.horasAprovadas / limiteHoras) * 100).toFixed(2)), 100) : 0;

  const avisos = atualizacoesRecentes.map((atividade) => ({
    id: atividade.id,
    tituloAtividade: atividade.titulo,
    status: atividade.status,
    mensagem: AVISOS_STATUS[atividade.status],
    motivoRecusa: atividade.motivo,
    data: atividade.validadaEm || atividade.createdAt,
  }));

  return {
    cards,
    progresso: {
      limiteHoras,
      horasConcluidas: cards.horasAprovadas,
      percentual: percentualProgresso,
    },
    avisos,
  };
};

export const listarCursosAtivosAluno = async (alunoId) => {
  const aluno = await buscarAlunoPorId(alunoId);

  if (!aluno) {
    return null;
  }

  return [
    {
      matriculaId: aluno.id,
      cursoId: aluno.curso.id,
      nomeCurso: aluno.curso.nome,
      instituicao: null,
      turno: null,
      periodoAtual: aluno.periodo,
      turma: aluno.turma,
      categoriaCurso: aluno.curso.categoria,
      tipoCurso: aluno.curso.tipoCurso,
      statusCurso: aluno.curso.status,
    },
  ];
};

const buildFiltroDataEnvio = (dataInicio, dataFim) => {
  if (!dataInicio && !dataFim) {
    return undefined;
  }

  return {
    gte: dataInicio || undefined,
    lte: dataFim || undefined,
  };
};

export const listarSolicitacoesDoAluno = async (alunoId, filtros = {}) => {
  const { categoria, status, ordenarHoras, ordenarData, dataInicio, dataFim } = filtros;

  const orderBy = [];

  if (ordenarHoras) {
    orderBy.push({ horasSolicitadas: ordenarHoras });
  }

  if (ordenarData) {
    orderBy.push({ createdAt: ordenarData });
  }

  if (!orderBy.length) {
    orderBy.push({ createdAt: "desc" });
  }

  return prisma.atividade.findMany({
    where: {
      alunoId,
      categoria: categoria || undefined,
      status: status || undefined,
      createdAt: buildFiltroDataEnvio(dataInicio, dataFim),
    },
    orderBy,
  });
};

export const buscarSolicitacaoDoAlunoPorId = (alunoId, atividadeId) =>
  prisma.atividade.findFirst({
    where: {
      id: atividadeId,
      alunoId,
    },
  });

export const criarSolicitacaoDoAluno = (dados) =>
  prisma.atividade.create({
    data: dados,
  });

export const atualizarSolicitacaoDoAluno = (atividadeId, dados) =>
  prisma.atividade.update({
    where: { id: atividadeId },
    data: dados,
  });

export const excluirSolicitacaoDoAluno = (atividadeId) =>
  prisma.atividade.delete({
    where: { id: atividadeId },
  });
