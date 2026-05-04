import express from "express";
import {
  solicitarRecuperacao,
  validarToken,
  redefinirSenha
} from "../controllers/AuthController.js";

const router = express.Router();

// solicitar link
router.post("/recuperar", solicitarRecuperacao);

// validar token
router.get("/validar-token", validarToken);

// nova senha
router.post("/redefinir", redefinirSenha);

export default router;

