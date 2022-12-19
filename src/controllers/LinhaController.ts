import { PrismaClient } from "@prisma/client";
import express from "express";
import { AuthMiddleware } from "../middleware";

const router = express.Router();
const prisma = new PrismaClient();

router.use(AuthMiddleware);

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
        viacaoId: false,
        pontoA: true,
        pontoB: true,
        valor: true,
        viacao: false,
        isActive: false,
        createdAt: true,
        horarios: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            linhaId: false,
            horario: true,
            isActive: false,
            createdAt: true,
          },
        },
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
        viacaoId: false,
        pontoA: true,
        pontoB: true,
        valor: true,
        viacao: false,
        isActive: false,
        createdAt: true,
        horarios: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            linhaId: false,
            horario: true,
            isActive: false,
            createdAt: true,
          },
        },
      },
    });

    if (!linha)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(linha);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.delete("/:viacaoId/linha/:linhaId/delete", async (req, res) => {
  try {
    const { linhaId } = req.params;

    const linha = await prisma.linha.findUnique({
      where: {
        id: linhaId,
      },
    });

    if (!linha) return res.status(400).send({ message: "Linha não existe." });

    const linhaEditada = await prisma.linha.update({
      where: {
        id: linhaId,
      },
      data: {
        isActive: false,
      },
    });

    if (!linhaEditada)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send({ message: "Linha deletada com sucesso." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
