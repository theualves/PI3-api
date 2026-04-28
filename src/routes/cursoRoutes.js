import express from 'express';
import { listarCursos, criarCurso, editarCurso, excluirCurso } from "../controllers/CursoController.js";

const router = express.Router();

router.get('/', listarCursos);
router.post('/', criarCurso);
router.put('/:id', editarCurso);
router.delete('/:id', excluirCurso);

export default router;