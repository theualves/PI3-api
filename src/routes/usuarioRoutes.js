import express from 'express';
import { criarUsuario, listarUsuarios } from '../controllers/UsuarioController.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', criarUsuario);

export default router;