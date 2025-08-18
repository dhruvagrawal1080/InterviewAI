import express from "express";
import { interviewChatController } from "../controllers/interview.controller.js";

const router = express.Router();

router.post("/ask", interviewChatController);

export default router;
