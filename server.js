import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/cursos', async (req, res) => {
  const { nome, tipo, horas, status } = req.body;
  try {
    const novoCurso = await prisma.curso.create({
      data: {
        nome,
        tipo,
        metaHoras: parseInt(horas),
        status
      },
    });
    res.status(201).json(novoCurso);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: "Erro ao salvar no banco." });
  }
});

app.get('/api/cursos', async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      orderBy: { createdAt: 'desc' } 
    });
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cursos." });
  }
});

app.listen(3001, () => console.log("🚀 API rodando na porta 3001"));