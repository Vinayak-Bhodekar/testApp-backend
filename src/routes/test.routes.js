import express from "express";
import { createTest, getTests } from "../controllers/test.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createTest);
router.get("/", getTests);

export default router;