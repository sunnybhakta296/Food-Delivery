import express from "express";
import { CustomerSignup, CustomerLogin, CustomerProfile } from "../controllers";
import { Authenticate } from "../middleware";
const router = express.Router();

/* -------------------------- singup/create user -------------------- */
router.post("/signup", CustomerSignup);

/* -------------------------- login user -------------------- */
router.post("/login", CustomerLogin);

/* -------------------------- Authenticated routes -------------------- */
router.use(Authenticate);

/* -------------------------- get profile -------------------- */
router.get("/profile", CustomerProfile);

export { router as CustomerRouter };
