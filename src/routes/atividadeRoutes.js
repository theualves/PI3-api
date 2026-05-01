import express from 'express';
import { listarAtividades, validarAtividade} from '../controllers/AtividadeController.js'

const router = express.Router();

router.get('/', listarAtividades);
router.put('/:id/validar', validarAtividade);

export default router;