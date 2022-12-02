import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:viacaoId/linha", async (req, res) => {
  try {
    const { viacaoId } = req.params;

    const linhas = await prisma.linha.findMany({
      where: {
        viacaoId: String(viacaoId),
        isActive: true,
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
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.post("/:viacaoId/linha/create", async (req, res) => {
  try {
    const { viacaoId } = req.params;
    const { pontoA, pontoB, valor } = req.body;

    const linha = await prisma.linha.create({
      data: {
        viacaoId: String(viacaoId),
        pontoA: String(pontoA),
        pontoB: String(pontoB),
        valor: Number(valor),
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
      return res
        .status(400)
        .send({ message: "Não foi possível criar a linha." });

    return res.status(200).send(linha);
  } catch (err) {
    return res.status(400).send({ message: "Não foi possível criar a linha." });
  }
});

export default router;
