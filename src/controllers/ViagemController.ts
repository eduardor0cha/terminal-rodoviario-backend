import { PrismaClient } from "@prisma/client";
import express from "express";
import { FileUploadMiddleware } from "../middleware";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const viagens = await prisma.viagem.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      viacaoId: true,
      destino: true,
      data: true,
      dataAntiga: true,
      horario: true,
      horarioAntigo: true,
      valor: true,
      valorAntigo: true,
      imagemUrl: true,
      viacao: false,
      isActive: false,
      createdAt: true,
    },
  });

  if (!viagens)
    return res.status(500).send({ message: "Algo inesperado aconteceu." });

  res.status(200).send(viagens);
});

router.post(
  "/create",
  FileUploadMiddleware.single("image"),
  async (req, res) => {
    if (req.file === undefined)
      return res.status(400).send({ message: "O campo image está vazio." });

    const imagemUrl = `/arquivo/${req.file.filename}`;

    const {
      viacaoId,
      destino,
      data,
      dataAntiga,
      horario,
      horarioAntigo,
      valor,
      valorAntigo,
    } = req.body;

    const viagem = await prisma.viagem.create({
      data: {
        viacaoId: viacaoId,
        destino: destino,
        data: data,
        dataAntiga: dataAntiga,
        horario: horario,
        horarioAntigo: horarioAntigo,
        valor: valor,
        valorAntigo: valorAntigo,
        imagemUrl: imagemUrl,
      },
      select: {
        id: true,
        viacaoId: true,
        destino: true,
        data: true,
        dataAntiga: true,
        horario: true,
        horarioAntigo: true,
        valor: true,
        valorAntigo: true,
        imagemUrl: true,
        viacao: false,
        isActive: false,
        createdAt: true,
      },
    });

    if (!viagem)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(viagem);
  }
);

export default router;
