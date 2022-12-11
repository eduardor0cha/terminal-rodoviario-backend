import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization)
      return res.status(401).send({ message: "Nenhum token foi enviado." });
    if (!authorization.startsWith("Bearer "))
      return res
        .status(401)
        .send({ message: "Token malformatado, expirado ou inválido." });
    if (!(authorization.split(" ").length == 2))
      return res
        .status(401)
        .send({ message: "Token malformatado, expirado ou inválido." });

    const token = authorization.split(" ")[1];

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err)
        return res
          .status(401)
          .send({ message: "Token malformatado, expirado ou inválido." });

      req["userId"] = decoded["id"];
      next();
    });
  } catch (err) {
    return res.status(500).send({ message: "Algo inesperado aconteceu." });
  }
};
