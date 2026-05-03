import express from 'express';
import { listarCursos, criarCurso, editarCurso, excluirCurso, opcoesFiltros } from "../controllers/CursoController.js";

const router = express.Router();

router.get('/', listarCursos);
router.get('/opcoes-filtros', opcoesFiltros);
router.post('/', criarCurso);
router.put('/:id', editarCurso);
router.delete('/:id', excluirCurso);

export default router;