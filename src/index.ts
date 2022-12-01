import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import AuthController from "./controllers/AuthController";
import UsuarioController from "./controllers/UsuarioController";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  app.use(cors());
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", AuthController);
app.use("/user", UsuarioController);

app.listen(process.env.PORT || 8000);
console.log(`Servidor rodando na porta ${process.env.PORT || 8000}`);
