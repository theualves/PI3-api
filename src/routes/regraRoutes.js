import express from "express";
import { salvarRegra, buscarRegra } from "../controllers/RegraController.js";

const router = express.Router();

router.post("/", salvarRegra);
router.get("/", buscarRegra);

export default router;