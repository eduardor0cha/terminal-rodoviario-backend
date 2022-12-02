import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    const userEmail = await prisma.usuario.findUnique({
      where: {
        email_isActive: {
          email: String(login),
          isActive: true,
        },
      },
    });

    if (userEmail) {
      if (await bcrypt.compare(password, userEmail.password)) {
        delete userEmail.password;
        delete userEmail.isActive;
        return res.status(200).send(userEmail);
      }
    }

    const userUsername = await prisma.usuario.findUnique({
      where: {
        username_isActive: {
          username: String(login),
          isActive: true,
        },
      },
    });

    if (userUsername) {
      if (await bcrypt.compare(password, userUsername.password)) {
        delete userUsername.password;
        delete userUsername.isActive;
        return res.status(200).send(userUsername);
      }
    }

    return res.status(400).send({ message: "Login ou senha inválido(s)." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { nome, username, email, password } = req.body;

    if (
      await prisma.usuario.findUnique({
        where: {
          username: String(username),
        },
      })
    )
      return res.status(400).send({ message: "Username já cadastrado." });

    if (await prisma.usuario.findUnique({ where: { email: email } }))
      return res.status(400).send({ message: "E-mail já cadastrado." });

    const encryptedPw = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome: String(nome),
        username: String(username),
        email: String(email),
        password: String(encryptedPw),
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

    return res.status(200).send(usuario);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
