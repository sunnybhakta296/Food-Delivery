import express, { Application } from "express";
import { CustomerRouter } from "../routes";

export default async (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/customer", CustomerRouter);
  return app;
};
