import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import SwaggerUi from "swagger-ui-express";

import {
  AuthController,
  HorarioController,
  LinhaController,
  UsuarioController,
  ViacaoController,
  ViagemController,
} from "./controllers/index";
import Grid from "gridfs-stream";
import mongoose from "mongoose";

import SwaggerDocs from "./swagger.json";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  app.use(cors());
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/docs", SwaggerUi.serve, SwaggerUi.setup(SwaggerDocs));

mongoose.connect(process.env.DATABASE_URL);

app.get("/arquivo/:filename", async (req, res) => {
  try {
    const conn = mongoose.connection;
    const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "Imagens",
    });
    const gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("Imagens");
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readStream = gridfsBucket.openDownloadStream(file._id);
    readStream.pipe(res);
  } catch (erro) {
    res.status(400).send({ message: "Arquivo não encontrado" });
  }
});

app.use("/auth", AuthController);
app.use("/user", UsuarioController);
app.use("/viagem", ViagemController);
app.use("/viacao", ViacaoController);
app.use("/viacao", LinhaController);
app.use("/viacao", HorarioController);

app.listen(process.env.PORT || 8000);
console.log(`Servidor rodando na porta ${process.env.PORT || 8000}`);
