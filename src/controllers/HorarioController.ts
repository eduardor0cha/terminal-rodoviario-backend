import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:viacaoId/linha/:linhaId/horario", async (req, res) => {
  const { linhaId } = req.params;

  const horarios = await prisma.horario.findMany({
    where: {
      linhaId: linhaId,
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
});

router.post("/:viacaoId/linha/:linhaId/horario/create", async (req, res) => {
  const { linhaId } = req.params;

  const { horario } = req.body;

  const horarioResponse = await prisma.horario.create({
    data: {
      linhaId: linhaId,
      horario: horario,
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
});

export default router;
