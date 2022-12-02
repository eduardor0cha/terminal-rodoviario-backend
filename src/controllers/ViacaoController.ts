import { PrismaClient } from "@prisma/client";
import express from "express";
import { FileUploadMiddleware } from "../middleware";
import { saveImage } from "../utils/ImageUtils";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const viacoes = await prisma.viacao.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      nome: true,
      cnpj: true,
      imagemUrl: true,
      linhas: {
        select: {
          id: true,
          viacaoId: true,
          pontoA: true,
          pontoB: true,
          valor: true,
          viacao: false,
          horarios: {
            select: {
              id: true,
              linhaId: false,
              horario: true,
              linha: false,
              isActive: false,
              createdAt: true,
            },
          },
          isActive: false,
          createdAt: true,
        },
      },
      isActive: false,
      createdAt: true,
    },
  });

  if (!viacoes)
    return res.status(500).send({ message: "Algo inesperado aconteceu." });

  return res.status(200).send(viacoes);
});

router.post(
  "/create",
  FileUploadMiddleware.single("image"),
  async (req, res) => {
    if (req.file === undefined)
      return res.status(400).send({ message: "O campo image está vazio." });

    const imagemUrl = `/arquivo/${req.file.filename}`;

    const { nome, cnpj } = req.body;

    const response = await prisma.viacao.findUnique({
      where: {
        cnpj: cnpj,
      },
    });

    if (response)
      return res.status(400).send({ message: "CNPJ já cadastrado." });

    const viagem = await prisma.viacao.create({
      data: {
        nome: nome,
        cnpj: cnpj,
        imagemUrl: imagemUrl,
      },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        imagemUrl: true,
        linhas: {
          select: {
            id: true,
            viacaoId: true,
            pontoA: true,
            pontoB: true,
            valor: true,
            viacao: false,
            horarios: {
              select: {
                id: true,
                linhaId: false,
                horario: true,
                linha: false,
                isActive: false,
                createdAt: true,
              },
            },
            isActive: false,
            createdAt: true,
          },
        },
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
