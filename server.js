import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import cursoRoutes from './src/routes/cursoRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import limiteRoutes from './src/routes/limiteRoutes.js';
import regraRoutes from './src/routes/regraRoutes.js';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/limite', limiteRoutes);
app.use('/api/regra', regraRoutes);

app.listen(3001, () => console.log("🚀 API rodando na porta 3001"));