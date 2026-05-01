import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();



export const criarAluno = async (req, res) => {
  try {
    const { nome, email, senha, cursoId, turma, periodo, cargaExigida } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo: 'ALUNO',
        cursoId
      }
    });

    const aluno = await prisma.aluno.create({
      data: {
        usuarioId: usuario.id,
        cursoId,
        turma,
        periodo,
        cargaExigida
      }
    });

    res.status(201).json(aluno);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

export const listarAlunos = async (req, res) => {
  const { cursoId, turma, nome } = req.query;

  const alunos = await prisma.aluno.findMany({
    where: {
      cursoId: cursoId || undefined,
      turma: turma || undefined,
      usuario: {
        nome: nome ? { contains: nome } : undefined
      }
    },
    include: {
      usuario: true
    }
  });

  res.json(alunos);
};