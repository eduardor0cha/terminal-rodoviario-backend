import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:viacaoId/linha/:linhaId/horario", async (req, res) => {
  try {
    const { linhaId } = req.params;

    const horarios = await prisma.horario.findMany({
      where: {
        linhaId: linhaId,
        isActive: true,
      },
      select: {
        id: true,
        linhaId: false,
        horario: true,
        linha: false,
        isActive: false,
        createdAt: true,
      },
    });

    if (!horarios)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(horarios);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.post("/:viacaoId/linha/:linhaId/horario/create", async (req, res) => {
  try {
    const { linhaId } = req.params;

    const { horario } = req.body;

    const horarioResponse = await prisma.horario.create({
      data: {
        linhaId: String(linhaId),
        horario: String(horario),
      },
      select: {
        id: true,
        linhaId: true,
        horario: true,
        linha: false,
        isActive: false,
        createdAt: true,
      },
    });

    if (!horarioResponse)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(horarioResponse);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
