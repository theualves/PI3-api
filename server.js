import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cursoRoutes from './src/routes/cursoRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cursos', cursoRoutes);

app.listen(3001, () => console.log("🚀 API rodando na porta 3001"));