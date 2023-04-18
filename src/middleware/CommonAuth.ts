import { NextFunction, Request, Response } from "express";
import { CustomerPayload } from "../dto";
import { ValidateSignature } from "../utility/PasswordUtility";

declare global {
  namespace Express {
    interface Request {
      user?: CustomerPayload;
    }
  }
}

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = await ValidateSignature(req);
  if (signature) {
    return next();
  } else {
    return res.status(404).json({ msg: "Unauthorized user" });
  }
};
