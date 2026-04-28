import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Criar Usuário (POST)
export const criarUsuario = async (req, res) => {
  const { nome, email, cursoId, status } = req.body;
  try {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
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
  try {
    const usuarios = await prisma.usuario.findMany({
      // A mágica do ORM: Traz os dados do curso junto com o usuário!
      include: {
        curso: true 
      }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};