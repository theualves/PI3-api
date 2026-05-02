import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

export const criarUsuario = async (req, res) => {
  const { nome, email, senha, tipo, cursoId, status } = req.body;
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo,
        cursoId: cursoId || null,
        status: status || "Ativo",
      },
      include: {
        curso: true,
      },
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};

export const listarUsuarios = async (req, res) => {
  const { tipo, cursoId, nome, email } = req.query;
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        tipo: tipo || undefined,
        cursoId: cursoId || undefined,
        nome: nome ? { contains: nome } : undefined,
        email: email ? { contains: email } : undefined,
      },
      include: {
        curso: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

export const contarUsuarios = async (req, res) => {
  const { tipo } = req.query;
  try {
    const total = await prisma.usuario.count({
      where: {
        tipo: tipo || undefined,
      },
    });
    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao contar usuários." });
  }
};
export const relatorioCoordenadores = async (_req, res) => {
  try {
    const coordenadores = await prisma.usuario.findMany({
      where: {
        tipo: { in: ["COORDENADOR", "GESTOR"] },
      },
      include: {
        curso: true,
        atividadesValidadas: {
          select: { id: true, status: true, horasAprovadas: true },
        },
      },
      orderBy: { nome: "asc" },
    });

    const coordenadoresComMetricas = coordenadores.map((item) => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      tipo: item.tipo,
      curso: item.curso?.nome || null,
      totalValidacoes: item.atividadesValidadas.length,
      totalAprovadas: item.atividadesValidadas.filter((a) => a.status === "APROVADA").length,
      horasAprovadas: item.atividadesValidadas.reduce((acc, atual) => acc + (atual.horasAprovadas || 0), 0),
    }));

    res.json({
      totalCoordenadores: coordenadoresComMetricas.length,
      coordenadores: coordenadoresComMetricas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar relatório de coordenadores." });
  }
};
