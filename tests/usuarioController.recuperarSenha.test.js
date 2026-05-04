import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { recuperarSenha } from "../src/controllers/UsuarioController.js";
import { prisma } from "../src/lib/prisma.js";

const criarRespostaMock = () => {
  const res = {
    statusCode: null,
    body: null,
  };

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload) => {
    res.body = payload;
    return res;
  };

  return res;
};

let originalFindFirst;
let originalFrontendUrl;

beforeEach(() => {
  originalFindFirst = prisma.usuario.findFirst;
  originalFrontendUrl = process.env.FRONTEND_URL;
});

afterEach(() => {
  prisma.usuario.findFirst = originalFindFirst;
  if (originalFrontendUrl === undefined) {
    delete process.env.FRONTEND_URL;
  } else {
    process.env.FRONTEND_URL = originalFrontendUrl;
  }
});

test("retorna 400 quando aluno não informa matrícula", async () => {
  prisma.usuario.findFirst = async () => {
    throw new Error("Não deveria consultar banco quando validação falha.");
  };

  const req = {
    body: {
      tipo: "aluno",
      email: "aluno@exemplo.com",
    },
  };
  const res = criarRespostaMock();

  await recuperarSenha(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Dados inválidos.");
  assert.ok(
    res.body.fields.some((fieldError) => fieldError.field === "matricula"),
  );
});

test("retorna 400 quando coordenador não informa idCoordenador", async () => {
  const req = {
    body: {
      tipo: "coordenador",
      email: "coord@exemplo.com",
    },
  };
  const res = criarRespostaMock();

  await recuperarSenha(req, res);

  assert.equal(res.statusCode, 400);
  assert.ok(
    res.body.fields.some((fieldError) => fieldError.field === "idCoordenador"),
  );
});

test("retorna 400 quando gestor não informa idAdministrativo", async () => {
  const req = {
    body: {
      tipo: "gestor",
      email: "gestor@exemplo.com",
    },
  };
  const res = criarRespostaMock();

  await recuperarSenha(req, res);

  assert.equal(res.statusCode, 400);
  assert.ok(
    res.body.fields.some((fieldError) => fieldError.field === "idAdministrativo"),
  );
});

test("retorna 404 quando usuário não é encontrado", async () => {
  let consulta;
  prisma.usuario.findFirst = async (args) => {
    consulta = args;
    return null;
  };

  const req = {
    body: {
      tipo: " coordenador ",
      email: " coord@exemplo.com ",
      idCoordenador: " abc-123 ",
    },
  };
  const res = criarRespostaMock();

  await recuperarSenha(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error, "Não foi encontrado usuário com os dados informados.");
  assert.deepEqual(consulta.where, {
    tipo: "coordenador",
    email: "coord@exemplo.com",
    id: "abc-123",
  });
});

test("retorna 200 e gera link de recuperação no sucesso", async () => {
  process.env.FRONTEND_URL = "https://app.exemplo.com";
  prisma.usuario.findFirst = async () => ({
    id: "aluno-1",
    email: "aluno@exemplo.com",
  });

  const req = {
    body: {
      tipo: "aluno",
      email: "aluno@exemplo.com",
      matricula: "aluno-1",
    },
  };
  const res = criarRespostaMock();

  await recuperarSenha(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.perfil, "aluno");
  assert.equal(res.body.destino, "aluno@exemplo.com");
  assert.ok(
    res.body.resetLink.startsWith(
      "https://app.exemplo.com/redefinir-senha?token=",
    ),
  );

  const token = res.body.resetLink.split("token=")[1];
  assert.match(token, /^[a-f0-9]{48}$/);
});
