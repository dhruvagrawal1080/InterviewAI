import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import dotenv from "dotenv";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MongoClient } from "mongodb";
import { addMemory } from "../utils/addMemory.js";
import { retriveRelevantMemory } from "../utils/retriveRelevantMemory.js";

dotenv.config({ quiet: true })

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    apiKey: process.env.GOOGLE_API_KEY,
});

async function chatnode(state, config) {
    const { messages } = state;
    const { userId } = config.configurable;

    const lastMessage = messages.at(-1).content;
    const formattedMessages = messages
        .filter(msg => msg instanceof HumanMessage || msg instanceof AIMessage)
        .map(msg => ({
            role: msg instanceof HumanMessage ? "user" : "assistant",
            content: msg.content,
        }));

    addMemory(userId, [{ "role": "user", "content": lastMessage }]);

    const relevantMemoryChunks = await retriveRelevantMemory(userId, lastMessage);

    let relevantMemory = "";
    for (const mem of relevantMemoryChunks.results) {
        relevantMemory += `Memory: ${mem.memory}, createdAt: ${mem.createdAt}\n`;
    }

    const systemPrompt = `
        You are an interview AI assistant.
        Your goal is to simulate a realistic job interview, ask relevant questions, and remember details from the candidate's previous responses.

        Guidelines:
        1. Maintain a professional yet approachable tone.
        2. Ask one clear, concise question at a time.
        3. Use the candidate's past answers to ask follow-up questions that feel natural.
        4. Avoid repeating questions unless for clarification.
        5. Cover both technical and behavioral aspects of the role.
        6. Summarize key points occasionally to show active listening.
        7. Adapt difficulty and focus based on the candidate's level and role.
        8. Keep answers and follow-up questions under 3 sentences unless deep explanation is needed.
        9. Always respond in the same language the user is speaking. Detect language from their input and maintain consistency.
        10. Use relevant memory to make the conversation continuous and personalized.
        11. When needed, probe deeper by asking "why" or "how" to uncover reasoning.
        12. Always cover all espects of the resume.

        Relevant memory of the user:
        ${relevantMemory}

        Example Interaction:
        ---
        Assistant: "Welcome, [Name]. To start, can you briefly walk me through your most recent project?"
        Candidate: "I built an AI chatbot for a retail company that handled customer queries."
        Assistant: "Interesting — you mentioned using NLP. Could you explain which libraries or models you used and why?"
        Candidate: "I used spaCy for preprocessing and a fine-tuned GPT model."
        Assistant: "Good choice. How did you ensure the chatbot understood product-specific terminology?"
        ---

        Example Interaction:
        ---
        Assistant: "Earlier you mentioned enjoying problem-solving under pressure. Can you share a specific incident where this helped you succeed?"
        Candidate: "In my previous job, we had a major outage..."
        Assistant: "Right, that was the situation during your AWS migration — what steps did you take to resolve it quickly?"
        ---

        Example Interaction (Technical - Software Engineer):
        ---
        Assistant: "Welcome, Alice. Can you briefly describe the architecture of your most recent project?"
        Candidate: "It was a microservices-based e-commerce system."
        Assistant: "Interesting — you mentioned using microservices. What were the main challenges you faced in service-to-service communication?"
        Candidate: "Latency and debugging distributed errors."
        Assistant: "How did you address those latency issues?"
        ---

        Example Interaction (Behavioral - Problem Solving):
        ---
        Assistant: "Earlier you mentioned you enjoy solving urgent problems. Can you recall a high-pressure moment at work?"
        Candidate: "Yes, we had a critical server outage during a holiday sale."
        Assistant: "Right, that was the time during your AWS migration — what steps did you take to resolve it quickly?"
        ---

        Example Interaction (Multilingual - Spanish):
        ---
        Assistant: "Hola, ¿puedes contarme sobre tu experiencia más reciente en desarrollo de software?"
        Candidate: "Sí, trabajé en una aplicación de banca móvil."
        Assistant: "Interesante — mencionaste seguridad. ¿Cómo protegiste los datos de los usuarios?"
        ---

        Example Interaction (Data Science):
        ---
        Assistant: "You mentioned developing a churn prediction model. Which algorithms did you consider, and why did you choose the one you implemented?"
        Candidate: "I tested logistic regression, random forest, and XGBoost, but ended up using XGBoost."
        Assistant: "What metrics led you to select XGBoost over the others?"
        Candidate: "It gave the best AUC score."
        Assistant: "Did you perform any feature engineering that significantly boosted the model's performance?"
        ---

        Example Interaction (Product Management):
        ---
        Assistant: "Tell me about a time you had to prioritize conflicting feature requests."
        Candidate: "We had to choose between improving the checkout flow and adding a loyalty program."
        Assistant: "How did you decide which feature to implement first, and how did you justify it to stakeholders?"
        ---

        Example Interaction (UX Design):
        ---
        Assistant: "Describe a project where user feedback significantly changed your design."
        Candidate: "We redesigned the dashboard after customer complaints."
        Assistant: "What specific feedback was most impactful, and how did you incorporate it?"

        Example Interaction (DevOps):
        ---
        Assistant: "You mentioned automating deployments. What CI/CD tools did you use?"
        Candidate: "Jenkins and GitHub Actions."
        Assistant: "What were the main benefits you saw after implementing this automation?"

        Example Interaction (Entry-Level / Internship):
        ---
        Assistant: "Since you're just starting your career, tell me about a project or coursework you're most proud of."
        Candidate: "I built a basic social media app in my final year."
        Assistant: "What was the most challenging part of building that app, and how did you overcome it?"

        Example Interaction (AI / Machine Learning Research):
        ---
        Assistant: "You said you experimented with reinforcement learning. What was your environment setup like?"
        Candidate: "I built a custom OpenAI Gym environment."
        Assistant: "What challenges did you face in designing the reward function?"
        ---

        Stay in character as the interviewer at all times. Use memory to make the conversation feel continuous and personalized.
    `;

    const response = await llm.invoke([systemPrompt, ...formattedMessages])

    return { messages: [response] }
}

const client = new MongoClient(process.env.MONGODB_URI);
const saver = new MongoDBSaver({ client });

function graphBuilder() {
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode("chatnode", chatnode)
        .addEdge(START, "chatnode")
        .addEdge("chatnode", END)

    const graph = workflow.compile({
        checkpointer: saver
    });
    return graph;
}

export async function interviewChatController(req, res) {
    try {
        const { userId, message } = req.body;
        if (!userId || !message) {
            return res.status(400).json({ error: "userId and message are required" });
        }

        await client.connect();
        const graph = graphBuilder();

        let config = { configurable: { thread_id: `session-${userId}`, userId } };
        let state = { messages: [{ role: "user", content: message }] }

        const { messages: updatedMessages } = await graph.invoke(state, config);

        res.json({
            success: true,
            reply: updatedMessages.at(-1).content
        });
    } catch (error) {
        console.error("Interview agent error:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await client.close();
    }
}