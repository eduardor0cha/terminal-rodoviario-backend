import { PrismaClient } from "@prisma/client";
import express from "express";
import { AuthMiddleware, FileUploadMiddleware } from "../middleware";

const router = express.Router();
const prisma = new PrismaClient();

router.use(AuthMiddleware);

router.get("/", async (req, res) => {
  try {
    const viacoes = await prisma.viacao.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        imagemUrl: true,
        isActive: false,
        createdAt: true,
        linhas: {
          where: {
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
                linha: false,
                isActive: false,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!viacoes)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(viacoes);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.post(
  "/create",
  FileUploadMiddleware.single("imagem"),
  async (req, res) => {
    try {
      if (req.file === undefined)
        return res.status(400).send({ message: "O campo imagem está vazio." });

      const imagemUrl = `/arquivo/${req.file.filename}`;

      const { nome, cnpj } = req.body;

      const response = await prisma.viacao.findUnique({
        where: {
          cnpj: cnpj,
        },
      });

      if (response)
        return res.status(400).send({ message: "CNPJ já cadastrado." });

      const viacao = await prisma.viacao.create({
        data: {
          nome: String(nome),
          cnpj: String(cnpj),
          imagemUrl: String(imagemUrl),
        },
        select: {
          id: true,
          nome: true,
          cnpj: true,
          imagemUrl: true,
          isActive: false,
          createdAt: true,
          linhas: {
            where: {
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
                  linha: false,
                  isActive: false,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      if (!viacao)
        return res.status(500).send({ message: "Algo inesperado aconteceu." });

      return res.status(200).send(viacao);
    } catch (err) {
      return res.status(500).send({ message: "Algo inesperado aconteceu." });
    }
  }
);

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const viacao = await prisma.viacao.findUnique({
      where: {
        id: id,
      },
    });

    if (!viacao) return res.status(400).send({ message: "Viação não existe." });

    const viacaoEditada = await prisma.viacao.update({
      where: {
        id: id,
      },
      data: {
        isActive: false,
      },
    });

    if (!viacaoEditada)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send({ message: "Viação deletada com sucesso." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
