import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import cursoRoutes from './src/routes/cursoRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import limiteRoutes from './src/routes/limiteRoutes.js';
import regraRoutes from './src/routes/regraRoutes.js';


const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/limite', limiteRoutes);
app.use('/api/regra', regraRoutes);
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'mysql' });
  } catch {
    res.status(503).json({ status: 'error', db: 'mysql' });
  }
});
app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON inválido." });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor." });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`🚀 API rodando na porta ${PORT} (MySQL conectado)`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar no MySQL:', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
