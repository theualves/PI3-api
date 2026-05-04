import { prisma } from "../lib/prisma.js";
import crypto from "crypto";

export const solicitarRecuperacao = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 3600000); // 1h

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: token,
        resetTokenExpira: expira
      }
    });

    const link = `http://localhost:3001/recuperar-senha?token=${token}`;

    //envio email
    console.log("LINK DE RECUPERAÇÃO:", link);

    res.json({ message: "Link enviado para o e-mail." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao solicitar recuperação." });
  }
};


export const validarToken = async (req, res) => {
  const { token } = req.query;

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpira: {
          gte: new Date()
        }
      }
    });

    if (!usuario) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    res.json({ valid: true });

  } catch (error) {
    res.status(500).json({ error: "Erro ao validar token." });
  }
};


import bcrypt from "bcrypt";

export const redefinirSenha = async (req, res) => {
  const { token, novaSenha } = req.body;

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpira: {
          gte: new Date()
        }
      }
    });

    if (!usuario) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpira: null
      }
    });

    res.json({ message: "Senha redefinida com sucesso." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao redefinir senha." });
  }
};

