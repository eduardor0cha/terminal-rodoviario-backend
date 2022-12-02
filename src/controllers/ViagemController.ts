import { PrismaClient } from "@prisma/client";
import express from "express";
import { FileUploadMiddleware } from "../middleware";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.post(
  "/create",
  FileUploadMiddleware.single("image"),
  async (req, res) => {
    try {
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
          viacaoId: String(viacaoId),
          destino: String(destino),
          data: new Date(data),
          dataAntiga: new Date(dataAntiga),
          horario: String(horario),
          horarioAntigo: String(horarioAntigo),
          valor: Number(valor),
          valorAntigo: Number(valorAntigo),
          imagemUrl: String(imagemUrl),
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
    } catch (err) {
      return res.status(500).send({ message: "Algo inesperado aconteceu." });
    }
  }
);

export default router;
