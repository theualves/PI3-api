import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Criar Usuário (POST)
export const criarUsuario = async (req, res) => {
  const { nome, email, senha, tipo, cursoId, status } = req.body;
  try {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
        tipo,
        cursoId: cursoId || null, // Associa ao curso se for enviado
        status: status || "Ativo"
      },
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};

export const listarUsuarios = async (req, res) => {
  const { tipo } = req.query; // Permite filtrar por tipo (Aluno, Professor, Admin)
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        tipo: tipo || undefined, // Se tipo for fornecido, filtra; caso contrário, traz todos
      },
      // A mágica do ORM: Traz os dados do curso junto com o usuário!
      include: {
        curso: true,
        cursosCoordenados: true
      }
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

export const contarUsuarios = async (req, res) => {
  try {
    const total = await prisma.usuario.count();
    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao contar usuários." });
  }
};