import { prisma } from "../lib/prisma.js";
import crypto from "crypto";
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
  if (!isNonEmptyString(nome)) {
    validationErrors.push({ field: "nome", message: "Campo obrigatório." });
  }
  if (!isValidEmail(email)) {
    validationErrors.push({
      field: "email",
      message: "Formato de e-mail inválido.",
    });
  }
  if (!isNonEmptyString(senha)) {
    validationErrors.push({ field: "senha", message: "Campo obrigatório." });
  }
  if (!isNonEmptyString(tipo)) {
    validationErrors.push({ field: "tipo", message: "Campo obrigatório." });
  }
  if (cursoId !== undefined && cursoId !== null && !isNonEmptyString(cursoId)) {
    validationErrors.push({
      field: "cursoId",
      message: "Se informado, precisa ser um ID válido.",
    });
  }
  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }
  try {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha.trim(),
        tipo: tipo.trim(),
        cursoId: isNonEmptyString(cursoId) ? cursoId.trim() : null,
        status: isNonEmptyString(status) ? status.trim() : "Ativo",
      },
      include: {
        curso: true,
        cursosCoordenados: true,
      },
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao criar usuário.");
  }
};

export const recuperarSenha = async (req, res) => {
  const { tipo, email, matricula, idCoordenador, idAdministrativo } = req.body;

  const validationErrors = [];

  if (!isNonEmptyString(tipo)) {
    validationErrors.push({ field: "tipo", message: "Campo obrigatório." });
  }

  if (!isValidEmail(email)) {
    validationErrors.push({
      field: "email",
      message: "Formato de e-mail inválido.",
    });
  }

  const tipoNormalizado = isNonEmptyString(tipo) ? tipo.trim().toLowerCase() : "";

  if (tipoNormalizado === "aluno" && !isNonEmptyString(matricula)) {
    validationErrors.push({
      field: "matricula",
      message: "Campo obrigatório para aluno.",
    });
  }

  if (tipoNormalizado === "coordenador" && !isNonEmptyString(idCoordenador)) {
    validationErrors.push({
      field: "idCoordenador",
      message: "Campo obrigatório para coordenador.",
    });
  }

  if (tipoNormalizado === "gestor" && !isNonEmptyString(idAdministrativo)) {
    validationErrors.push({
      field: "idAdministrativo",
      message: "Campo obrigatório para gestor.",
    });
  }

  if (!["aluno", "coordenador", "gestor"].includes(tipoNormalizado)) {
    validationErrors.push({
      field: "tipo",
      message: "Tipo deve ser aluno, coordenador ou gestor.",
    });
  }

  if (validationErrors.length > 0) {
    return sendValidationError(res, validationErrors);
  }

  let identificador = "";
  if (tipoNormalizado === "aluno") {
    identificador = matricula.trim();
  }
  if (tipoNormalizado === "coordenador") {
    identificador = idCoordenador.trim();
  }
  if (tipoNormalizado === "gestor") {
    identificador = idAdministrativo.trim();
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: {
        tipo: tipoNormalizado,
        email: email.trim(),
        id: identificador,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "Não foi encontrado usuário com os dados informados.",
      });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/redefinir-senha?token=${token}`;

    return res.status(200).json({
      message: "Link de recuperação gerado e pronto para envio por e-mail.",
      perfil: tipoNormalizado,
      destino: usuario.email,
      resetLink,
      observacao: "Integre um serviço SMTP para envio real do e-mail.",
    });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao recuperar senha.");
  }
};

export const listarUsuarios = async (req, res) => {
  const { tipo, nome, email, cursoId } = req.query;
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        tipo: isNonEmptyString(tipo) ? tipo.trim() : undefined,
        nome: isNonEmptyString(nome) ? { contains: nome.trim() } : undefined,
        email: isNonEmptyString(email) ? { contains: email.trim() } : undefined,
        cursoId: isNonEmptyString(cursoId) ? cursoId.trim() : undefined,
      },
      include: {
        curso: true,
        cursosCoordenados: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(usuarios);
  } catch (error) {
    return handleControllerError(res, error, "Erro ao buscar usuários.");
  }
};

export const contarUsuarios = async (req, res) => {
  const { tipo } = req.query;
  try {
    const total = await prisma.usuario.count({
      where: {
        tipo: isNonEmptyString(tipo) ? tipo.trim() : undefined,
      },
    });
    res.json({ total });
  } catch (error) {
    return handleControllerError(res, error, "Erro ao contar usuários.");
  }
};