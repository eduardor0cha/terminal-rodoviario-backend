import { PrismaClient } from "@prisma/client";
import express from "express";
import { AuthMiddleware } from "../middleware";

const router = express.Router();
const prisma = new PrismaClient();

router.use(AuthMiddleware);

router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true,
        createdAt: true,
        password: false,
        isActive: false,
      },
    });

    if (!usuarios)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(usuarios);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!usuario)
      return res.status(400).send({ message: "Usuário não existe." });

    const usuarioEditado = await prisma.usuario.update({
      where: {
        id: String(id),
      },
      data: {
        isActive: false,
      },
    });

    if (!usuarioEditado)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send("Usuário deletado com sucesso.");
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
