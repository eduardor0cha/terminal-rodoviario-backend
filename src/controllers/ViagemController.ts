import { PrismaClient } from "@prisma/client";
import express from "express";
import { AuthMiddleware, FileUploadMiddleware } from "../middleware";

const router = express.Router();
const prisma = new PrismaClient();

router.use(AuthMiddleware);

router.get("/", async (req, res) => {
  try {
    const viagens = await prisma.viagem.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        destino: true,
        data: true,
        dataAntiga: true,
        horario: true,
        horarioAntigo: true,
        valor: true,
        valorAntigo: true,
        imagemUrl: true,
        isActive: false,
        createdAt: true,
        viacao: {
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
        },
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
  FileUploadMiddleware.single("imagem"),
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
          destino: true,
          data: true,
          dataAntiga: true,
          horario: true,
          horarioAntigo: true,
          valor: true,
          valorAntigo: true,
          imagemUrl: true,
          isActive: false,
          createdAt: true,
          viacao: {
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
          },
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

router.post("/:id/schedule", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req["userId"];

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: userId,
          isActive: true,
        },
      },
    });

    if (!usuario)
      return res.status(400).send({ message: "O usuário não existe." });

    const viagem = await prisma.viagem.findUnique({
      where: {
        id_isActive: {
          id: id,
          isActive: true,
        },
      },
    });

    if (!viagem)
      return res.status(400).send({ message: "A viagem não existe." });

    const viagemMarcada = await prisma.viagemMarcada.findUnique({
      where: {
        usuarioId_viagemId: {
          usuarioId: userId,
          viagemId: id,
        },
      },
    });

    if (viagemMarcada)
      return res.status(200).send({ message: "Viagem marcada com sucesso." });

    const viagemMarcada2 = await prisma.viagemMarcada.create({
      data: {
        usuarioId: userId,
        viagemId: id,
        confirmed: true,
      },
    });

    if (!viagemMarcada2)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send({ message: "Viagem marcada com sucesso." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.post("/:id/unschedule", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req["userId"];

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: userId,
          isActive: true,
        },
      },
    });

    if (!usuario)
      return res.status(400).send({ message: "O usuário não existe." });

    const viagem = await prisma.viagem.findUnique({
      where: {
        id_isActive: {
          id: id,
          isActive: true,
        },
      },
    });

    if (!viagem)
      return res.status(400).send({ message: "A viagem não existe." });

    const viagemMarcada = await prisma.viagemMarcada.findUnique({
      where: {
        usuarioId_viagemId: {
          usuarioId: userId,
          viagemId: id,
        },
      },
    });

    if (!viagemMarcada)
      return res
        .status(200)
        .send({ message: "Viagem desmarcada com sucesso." });

    const viagemMarcada2 = await prisma.viagemMarcada.delete({
      where: {
        usuarioId_viagemId: {
          usuarioId: userId,
          viagemId: id,
        },
      },
    });

    if (!viagemMarcada2)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send({ message: "Viagem desmarcada com sucesso." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.get("/scheduled", async (req, res) => {
  try {
    const userId = req["userId"];

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: userId,
          isActive: true,
        },
      },
    });

    if (!usuario)
      return res.status(400).send({ message: "O usuário não existe." });

    const viagensMarcadas = await prisma.viagemMarcada.findMany({
      where: {
        usuarioId: userId,
      },
      select: {
        viagem: {
          select: {
            id: true,
            destino: true,
            data: true,
            dataAntiga: true,
            horario: true,
            horarioAntigo: true,
            valor: true,
            valorAntigo: true,
            imagemUrl: true,
            isActive: false,
            createdAt: true,
            viacao: {
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
            },
          },
        },
      },
    });

    if (!viagensMarcadas)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res
      .status(200)
      .send(viagensMarcadas.map((viagemMarcada) => viagemMarcada.viagem));
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.get("/find", async (req, res) => {
  try {
    const { destino } = req.query;

    if (!destino) return res.status(200).send([]);

    const viagens = await prisma.viagem.findMany({
      where: {
        destino: {
          contains: destino.toString(),
        },
        isActive: true,
      },
    });

    return res.status(200).send(viagens);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const viagem = await prisma.viagem.findUnique({
      where: {
        id: id,
      },
    });

    if (!viagem) return res.status(400).send({ message: "Viagem não existe." });

    const viagemEditada = await prisma.viagem.update({
      where: {
        id: id,
      },
      data: {
        isActive: false,
      },
    });

    if (!viagemEditada)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send({ message: "Viagem deletada com sucesso." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.post("/:id/confirm-schedule", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req["userId"];

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: userId,
          isActive: true,
        },
      },
    });

    if (!usuario)
      return res.status(400).send({ message: "O usuário não existe." });

    const viagem = await prisma.viagem.findUnique({
      where: {
        id_isActive: {
          id: id,
          isActive: true,
        },
      },
    });

    if (!viagem)
      return res.status(400).send({ message: "A viagem não existe." });

    const viagemMarcada = await prisma.viagemMarcada.findUnique({
      where: {
        usuarioId_viagemId: {
          usuarioId: userId,
          viagemId: id,
        },
      },
    });

    if (!viagemMarcada)
      return res.status(400).send({ message: "Viagem não está marcada." });

    const viagemMarcada2 = await prisma.viagemMarcada.update({
      where: {
        usuarioId_viagemId: {
          usuarioId: userId,
          viagemId: id,
        },
      },
      data: {
        confirmed: true,
      },
    });

    if (!viagemMarcada2)
      return res.status(500).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send({ message: "Viagem confirmada com sucesso." });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

router.get("/pending-confirmation", async (req, res) => {
  try {
    const userId = req["userId"];

    const usuario = await prisma.usuario.findUnique({
      where: {
        id_isActive: {
          id: userId,
          isActive: true,
        },
      },
    });

    if (!usuario)
      return res.status(400).send({ message: "O usuário não existe." });

    const viagensPendentes = await prisma.viagemMarcada.findMany({
      where: {
        usuarioId: userId,
        confirmed: false,
      },
      select: {
        viagem: {
          select: {
            id: true,
            destino: true,
            data: true,
            dataAntiga: true,
            horario: true,
            horarioAntigo: true,
            valor: true,
            valorAntigo: true,
            imagemUrl: true,
            isActive: false,
            createdAt: true,
            viacao: {
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
            },
          },
        },
      },
    });

    if (!viagensPendentes)
      return res.status(200).send({ message: "Algo inesperado aconteceu." });

    return res.status(200).send(viagensPendentes);
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
});

export default router;
