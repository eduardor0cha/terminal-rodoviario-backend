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
        id: id,
      },
    });

    if (!usuario)
      return res.status(400).send({ message: "Usuário não existe." });

    const usuarioEditado = await prisma.usuario.update({
      where: {
        id: id,
      },
      data: {
        isActive: false,
      },
    });

    if (!usuarioEditado)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send({ message: "Usuário deletado com sucesso." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: id,
          isActive: true,
        },
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

    if (!usuario)
      return res.status(500).send({ message: "Usuário não existe." });

    return res.status(200).send(usuario);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, username, email, password } = req.body;

    const response = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: id,
          isActive: true,
        },
      },
    });

    if (!response)
      return res.status(400).send({ message: "Usuário não existe." });

    if (username) {
      const response2 = await prisma.usuario.findUnique({
        where: {
          username: username,
        },
      });

      if (response2) {
        return res.status(400).send({ message: "Username já cadastrado." });
      }
    }

    if (email) {
      const response3 = await prisma.usuario.findUnique({
        where: {
          email: email,
        },
      });

      if (response3) {
        return res.status(400).send({ message: "E-mail já cadastrado." });
      }
    }

    const usuario = await prisma.usuario.update({
      where: {
        id_isActive: {
          id: id,
          isActive: true,
        },
      },
      data: {
        nome: nome,
        username: username,
        email: email,
        password: password,
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

    if (!usuario)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(usuario);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
