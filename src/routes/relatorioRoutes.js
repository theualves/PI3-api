import express from 'express';
import { gerarRelatorio, gerarRelatorioPdf } from "../controllers/RelatorioController.js";

const router = express.Router();

router.get('/', gerarRelatorio );
router.get('/pdf', gerarRelatorioPdf);

export default router;