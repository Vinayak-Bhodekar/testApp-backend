import express from "express";
import { addQuestion } from "../controllers/question.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyJWT, addQuestion);

export default router;