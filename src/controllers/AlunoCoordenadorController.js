import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";

export const criarAluno = async (req, res) => {
  try {
    const { nome, email, cpf, senha, cursoId, turma, periodo, cargaExigida } = req.body;
    const senhaFinal = senha || gerarSenha();
    const senhaHash = await bcrypt.hash(senhaFinal, 10);

    const aluno = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipo: "ALUNO",
          cursoId,
        },
      });

      return tx.aluno.create({
        data: {
          usuarioId: usuario.id,
          cpf,
          cursoId,
          turma,
          periodo: Number(periodo),
          cargaExigida: Number(cargaExigida),
        },
        include: {
          usuario: true,
          curso: true,
        },
      });
    });

    res.status(201).json({
      ...aluno,
      senhaGerada: senha ? null : senhaFinal,
    });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

export const listarAlunos = async (req, res) => {
  const { cursoId, turma, nome, cpf } = req.query;

  const alunos = await prisma.aluno.findMany({
    where: {
      cursoId: cursoId || undefined,
      turma: turma || undefined,
      cpf: cpf ? { contains: cpf } : undefined,
      usuario: {
        nome: nome ? { contains: nome } : undefined,
      },
    },
    include: {
      usuario: true,
      curso: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(alunos);
};

export const gerarSenhaAutomatica = async (_req, res) => {
  res.json({ senha: gerarSenha() });
};

function gerarSenha() {
  return crypto.randomBytes(4).toString("hex");
}
