import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:viacaoId/linha", async (req, res) => {
  const { viacaoId } = req.params;

  const linhas = await prisma.linha.findMany({
    where: {
      viacaoId: viacaoId,
    },
    select: {
      id: true,
      viacaoId: true,
      pontoA: true,
      pontoB: true,
      valor: true,
      viacao: false,
      horarios: true,
      isActive: false,
      createdAt: true,
    },
  });

  if (!linhas)
    return res.status(500).send({ message: "Algo inesperado aconteceu." });

  return res.status(200).send(linhas);
});

router.post("/:viacaoId/linha/create", async (req, res) => {
  const { viacaoId } = req.params;
  const { pontoA, pontoB, valor } = req.body;

  const linha = await prisma.linha.create({
    data: {
      viacaoId: viacaoId,
      pontoA: pontoA,
      pontoB: pontoB,
      valor: valor,
    },
    select: {
      id: true,
      viacaoId: true,
      pontoA: true,
      pontoB: true,
      valor: true,
      viacao: false,
      horarios: true,
      isActive: false,
      createdAt: true,
    },
  });

  if (!linha)
    return res.status(400).send({ message: "Não foi possível criar a linha." });

  return res.status(200).send(linha);
});

export default router;
