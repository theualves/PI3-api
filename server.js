import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import cursoRoutes from './src/routes/cursoRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import limiteRoutes from './src/routes/limiteRoutes.js';
import regraRoutes from './src/routes/regraRoutes.js';
import alunoCoordenadorRoutes from './src/routes/alunoCoordenadorRoutes.js'
import atividadeRoutes from './src/routes/atividadeRoutes.js'
import relatorioRoutes from './src/routes/relatorioRoutes.js'


const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API de horas complementares online',
  });
});

app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/limite', limiteRoutes);
app.use('/api/regra', regraRoutes);
app.use('/api/aluno_coordenador', alunoCoordenadorRoutes);
app.use('/api/atividades', atividadeRoutes)
app.use('/api/relatorio', relatorioRoutes )

app.listen(3001, () => console.log(`Api rodando no http://localhost:${3001}`));