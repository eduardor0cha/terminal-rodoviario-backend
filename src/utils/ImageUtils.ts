import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function saveImage(file: Express.Multer.File): Promise<String | void> {
  const match = ["image/png", "image/jpeg", "image/jpg"];

  if (match.indexOf(file.mimetype)) {
    const nomeImagem = `${Date.now()}-termrod-database-${file.originalname}`;

    const imagem = await prisma.imagem.create({
      data: {
        nome: nomeImagem,
        bytes: file.buffer,
      },
    });

    if (imagem) {
      return nomeImagem;
    }
  }
}

export { saveImage };
