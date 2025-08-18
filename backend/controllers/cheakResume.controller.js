import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import dotenv from "dotenv";
import { addMemory } from "../utils/addMemory.js";
import { Blob } from "buffer";

dotenv.config();

const schema = z.object({
  answer: z.boolean()
});

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
}).withStructuredOutput(schema);

async function isResumeText(text) {
  const systemPrompt = `
    You are a document classifier.
    Classify the following text as this is "resume" or "user description" or "other".
    Resume documents typically include: work experience, projects, education, skills, contact info.
    If it is a "resume" or "user description" then return true otherwise return false.
    
    TEXT:
    ${text.slice(0, 3000)}...
  `;

  const result = await llm.invoke(systemPrompt);
  return result.answer;
}

export async function checkResume(req, res) {
  try {
    const { userId, description } = req.body;

    if (!req.file && !description) {
      return res.status(400).json({ error: "Please provide your resume (PDF or text)" });
    }

    let resumeContent = "";

    // If file uploaded, read PDF from memory
    if (req.file) {
      const blob = new Blob([req.file.buffer], { type: "application/pdf" });
      const loader = new PDFLoader(blob);
      const docs = await loader.load();
      resumeContent = docs.map(doc => doc.pageContent).join("\n");
    }

    const userDescription = resumeContent || description;
    const isResume = await isResumeText(userDescription);

    if (!isResume) {
      return res.status(400).json({ error: "The provided file/description is not a resume" });
    }

    addMemory(userId, userDescription);

    res.status(200).json({
      success: true,
      message: "Resume is Validated"
    })
  } catch (err) {
    console.error("Resume check error:", err);
    res.status(500).json({ error: "Error while checking resume" });
  }
}
