import bcrypt from "bcrypt";

import { Request } from "express";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config";
import { CustomerPayload } from "../dto";

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const validatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload: CustomerPayload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "10d" });
};

export const ValidateSignature = async (req: Request) => {
  const signature = req.get("Authorization");

  if (signature) {
    try {
      const payload = (await jwt.verify(
        signature.split(" ")[1],
        APP_SECRET
      )) as CustomerPayload;
      req.user = payload;
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
};
