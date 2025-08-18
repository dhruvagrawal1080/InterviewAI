import express from "express";
import { interviewSummary } from "../controllers/interviewSummary.controller.js";

const router = express.Router();

router.post("/summary", interviewSummary);

export default router;
