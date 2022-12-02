import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

const storage = new GridFsStorage({
  url: process.env.DATABASE_URL,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg", "image/jpg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-termrod-database-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "Imagens",
      filename: `${Date.now()}-termrod-database-${file.originalname}`,
    };
  },
});

export default multer({ storage });
