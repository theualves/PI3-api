import express from 'express';
import { criarUsuario, listarUsuarios, contarUsuarios, recuperarSenha } from '../controllers/UsuarioController.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', criarUsuario);
router.post('/recuperar-senha', recuperarSenha);
router.get("/contar", contarUsuarios);

export default router;