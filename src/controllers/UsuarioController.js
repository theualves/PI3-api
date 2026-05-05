import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
import bcrypt from "bcrypt"; // Importado para proteger as senhas
import {
  isNonEmptyString,
  isValidEmail,
  sendValidationError,
} from "../utils/validation.js";
import { handleControllerError } from "../utils/apiErrors.js";

// Criar Usuário (POST)
export const criarUsuario = async (req, res) => {
  const { nome, email, senha, tipo, cursoId, status } = req.body;

  const validationErrors = [];
  if (!isNonEmptyString(nome)) validationErrors.push({ field: "nome", message: "Campo obrigatório." });
  if (!isValidEmail(email)) validationErrors.push({ field: "email", message: "E-mail inválido." });
  if (!isNonEmptyString(senha)) validationErrors.push({ field: "senha", message: "Campo obrigatório." });
  if (!isNonEmptyString(tipo)) validationErrors.push({ field: "tipo", message: "Campo obrigatório." });

  if (validationErrors.length > 0) return sendValidationError(res, validationErrors);

  try {
    // CRIPTOGRAFIA: Transforma a senha em Hash antes de salvar
    const senhaHash = await bcrypt.hash(senha.trim(), 10);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.trim(),
        senha: senhaHash, // Salva o hash, não o texto puro
        tipo: tipo.trim().toUpperCase(), // Garante que bata com o Enum (ex: COORDENADOR)
        cursoId: tipo.toUpperCase() === "GESTOR" ? null : (isNonEmptyString(cursoId) ? cursoId.trim() : null),
        status: isNonEmptyString(status) ? status.trim() : "Ativo",
      },
    });

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      usuario: { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email }
    });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao criar usuário. Verifique se o e-mail já existe.");
  }
};

// Listar Usuários (GET)
export const listarUsuarios = async (req, res) => {
  const { tipo, nome, email, cursoId } = req.query;
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        tipo: tipo ? tipo.toUpperCase() : undefined,
        nome: isNonEmptyString(nome) ? { contains: nome.trim() } : undefined,
        email: isNonEmptyString(email) ? { contains: email.trim() } : undefined,
        cursoId: isNonEmptyString(cursoId) ? cursoId.trim() : undefined,
      },
      include: {
        curso: { select: { nome: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(usuarios);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar usuários.");
  }
};

// Recuperar Senha (POST) - Simplificado para usar apenas E-mail e Tipo
export const recuperarSenha = async (req, res) => {
  const { tipo, email } = req.body;

  if (!isValidEmail(email) || !isNonEmptyString(tipo)) {
    return res.status(400).json({ error: "E-mail e Tipo são obrigatórios." });
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        email: email.trim(),
        tipo: tipo.toUpperCase(),
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expira = new Date(Date.now() + 3600000); // 1h

    // Grava o token no banco (bater com o Model que tem resetToken)
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken: token, resetTokenExpira: expira }
    });

    return res.status(200).json({
      message: "Token de recuperação gerado.",
      token: token, // Em produção, enviaria por e-mail
      observacao: "Use este token na rota de redefinir senha."
    });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao processar recuperação.");
  }
};

export const contarUsuarios = async (req, res) => {
  const { tipo } = req.query;
  try {
    const total = await prisma.usuario.count({
      where: { tipo: tipo ? tipo.toUpperCase() : undefined },
    });
    res.json({ total });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao contar usuários.");
  }
};
