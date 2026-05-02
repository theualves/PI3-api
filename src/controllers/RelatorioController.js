import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma.js";


export const gerarRelatorio = async (req, res) => {
  const { cursoId, periodo, categoria } = req.query;

  const dados = await prisma.atividade.findMany({
    where: {
      status: 'APROVADA',
      categoria: categoria || undefined,
      aluno: {
        cursoId: cursoId || undefined,
        periodo: periodo ? Number(periodo) : undefined
      }
    },
    include: {
      aluno: {
        include: {
          usuario: true
        }
      }
    }
  });

  const totalHorasAprovadas = dados.reduce(
    (acc, atividade) => acc + (atividade.horasAprovadas || 0),
    0
  );

  res.json({
    totalRegistros: dados.length,
    totalHorasAprovadas,
    dados,
  });
};
export const gerarRelatorioPdf = async (req, res) => {
  const { cursoId, periodo, categoria } = req.query;

  const dados = await prisma.atividade.findMany({
    where: {
      status: "APROVADA",
      categoria: categoria || undefined,
      aluno: {
        cursoId: cursoId || undefined,
        periodo: periodo ? Number(periodo) : undefined,
      },
    },
    include: {
      aluno: {
        include: {
          usuario: true,
          curso: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const buffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio-horas.pdf");
    res.send(buffer);
  });

  doc.fontSize(16).text("Relatório de Horas Complementares", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).text(`Curso: ${cursoId || "Todos"}`);
  doc.text(`Período: ${periodo || "Todos"}`);
  doc.text(`Categoria: ${categoria || "Todas"}`);
  doc.moveDown();

  dados.forEach((atividade, index) => {
    doc.fontSize(11).text(`${index + 1}. ${atividade.aluno.usuario.nome} (${atividade.aluno.cpf})`);
    doc.text(`Curso: ${atividade.aluno.curso.nome}`);
    doc.text(`Atividade: ${atividade.titulo}`);
    doc.text(`Categoria: ${atividade.categoria}`);
    doc.text(`Horas aprovadas: ${atividade.horasAprovadas || 0}`);
    doc.text(`Motivo/Observação: ${atividade.motivo || "-"}`);
    doc.moveDown();
  });

  doc.end();
};
