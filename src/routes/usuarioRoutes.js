import express from 'express';
import { criarUsuario, listarUsuarios, contarUsuarios, relatorioCoordenadores } from '../controllers/UsuarioController.js';

const router = express.Router();

router.get('/', listarUsuarios);
router.post('/', criarUsuario);
router.get("/contar", contarUsuarios);
router.get("/coordenadores/relatorio", relatorioCoordenadores);

export default router;