import express from 'express';
import { criarUsuario, listarUsuarios,contarUsuarios } from '../controllers/UsuarioController.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', criarUsuario);
router.get("/contar", contarUsuarios);

export default router;