import express from 'express';
import { criarAluno, listarAlunos } from "../controllers/AlunoCoordenadorController.js";

const router = express.Router();

router.post('/', criarAluno);
router.get('/', listarAlunos);

export default router;