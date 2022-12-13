import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthMiddleware } from "../middleware";

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

        const token = jwt.sign({ id: userEmail.id }, process.env.JWT_KEY, {
          expiresIn: "7d",
        });

        return res.status(200).send({ user: userEmail, token: token });
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

        const token = jwt.sign({ id: userUsername.id }, process.env.JWT_KEY, {
          expiresIn: "7d",
        });

        return res.status(200).send({ user: userUsername, token: token });
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

router.use(AuthMiddleware);

router.get("/logged", async (req, res) => {
  try {
    const userId = req["userId"];

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: userId,
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
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(usuario);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
