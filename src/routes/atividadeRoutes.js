import express from 'express';
import { criarAtividade, listarAtividades, validarAtividade, baixarComprovante } from '../controllers/AtividadeController.js'

const router = express.Router();
router.post('/', criarAtividade);

router.get('/', listarAtividades);
router.put('/:id/validar', validarAtividade);
router.get('/:id/comprovante/download', baixarComprovante);

export default router;