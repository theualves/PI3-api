import express from 'express';
import { criarAluno, listarAlunos, gerarSenhaAutomatica } from "../controllers/AlunoCoordenadorController.js";

const router = express.Router();

router.post('/', criarAluno);
router.get('/', listarAlunos);
router.get('/senha/automatica', gerarSenhaAutomatica);

export default router;