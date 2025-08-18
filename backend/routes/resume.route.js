import express from "express";
import multer from "multer";
import { checkResume } from "../controllers/cheakResume.controller.js";

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Upload PDF in memory and check
router.post("/check", upload.single("resume"), checkResume);

export default router;
