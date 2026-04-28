import express from "express";
import { salvarLimite, buscarLimite } from "../controllers/limiteController.js";

const router = express.Router();

router.post("/", salvarLimite);
router.get("/", buscarLimite);

export default router;