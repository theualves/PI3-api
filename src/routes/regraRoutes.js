import express from "express";
import { salvarRegra, buscarRegra } from "../controllers/regraController.js";

const router = express.Router();

router.post("/", salvarRegra);
router.get("/", buscarRegra);

export default router;