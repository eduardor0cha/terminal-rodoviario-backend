import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
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

  if (!usuarios) return res.status(200).send([]);

  return res.status(200).send(usuarios);
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: id,
    },
  });

  if (!usuario) return res.status(400).send({ error: "Usuário não existe." });

  const usuarioEditado = await prisma.usuario.update({
    where: {
      id: id,
    },
    data: {
      isActive: false,
    },
  });

  if (usuarioEditado)
    return res.status(200).send("Usuário deletado com sucesso.");

  return res.status(400).send("Não foi possível deletar o usuário.");
});

export default router;
