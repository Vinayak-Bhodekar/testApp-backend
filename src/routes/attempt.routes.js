import express from "express";
import { submitAttempt } from "../controllers/attempt.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, submitAttempt);

export default router;