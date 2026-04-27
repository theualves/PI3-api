import express from 'express';
import { listarCursos, criarCurso } from "../controllers/CursoController.js";

const router = express.Router();

router.get('/', listarCursos);
router.post('/', criarCurso);

export default router;