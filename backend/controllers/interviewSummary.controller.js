import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import dotenv from "dotenv";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MongoClient } from "mongodb";
import { retriveAllMemory } from "../utils/retriveAllMemory.js";
import { z } from "zod"

dotenv.config({ quiet: true })

const InterviewSummarySchema = z.object({
    overallPerformance: z.string().min(1, "overallPerformance must be a non-empty string"),
    title: z.string().min(1, "title must be a non-empty string"),

    // Score should be a number, not string - more appropriate for calculations
    score: z.number()
        .min(0, "score cannot be less than 0")
        .max(10, "score cannot be greater than 10")
        .refine(val => Number.isFinite(val), "score must be a valid number"),

    // Fixed rating validation - removed "|| true" which made validation meaningless
    rating: z.enum([
        "Outstanding",
        "Excellent",
        "Very Good",
        "Good",
        "Fair",
        "Needs Improvement",
        "Poor Performance"
    ], {
        errorMap: () => ({
            message: "rating must be one of: Outstanding, Excellent, Very Good, Good, Fair, Needs Improvement, Poor Performance"
        })
    }),

    sectionScores: z.object({
        behavioral: z.number()
            .min(0, "Behavioral score cannot be less than 0")
            .max(10, "Behavioral score cannot be greater than 10")
            .refine(val => Number.isFinite(val), "Behavioral score must be a valid number"),
        technical: z.number()
            .min(0, "Technical score cannot be less than 0")
            .max(10, "Technical score cannot be greater than 10")
            .refine(val => Number.isFinite(val), "Technical score must be a valid number"),
        communication: z.number()
            .min(0, "Communication score cannot be less than 0")
            .max(10, "Communication score cannot be greater than 10")
            .refine(val => Number.isFinite(val), "Communication score must be a valid number"),
    }),

    // Added better validation for array content
    strengths: z.array(
        z.string()
            .min(3, "Each strength must be at least 3 characters")
            .max(100, "Each strength must be at most 100 characters")
    )
        .min(2, "strengths must contain at least 2 items")
        .max(5, "strengths must contain at most 5 items")
        .refine(arr => new Set(arr).size === arr.length, "strengths must not contain duplicates"),

    areasOfImprovement: z.array(
        z.string()
            .min(3, "Each area of improvement must be at least 3 characters")
            .max(150, "Each area of improvement must be at most 150 characters")
    )
        .min(2, "areasOfImprovement must contain at least 2 items")
        .max(4, "areasOfImprovement must contain at most 4 items")
        .refine(arr => new Set(arr).size === arr.length, "areas of improvement must not contain duplicates"),

    listeningAdaptability: z.object({
        answeredExactly: z.string()
            .min(10, "answeredExactly must be at least 10 characters for meaningful feedback")
            .max(300, "answeredExactly must be at most 300 characters"),
        adaptability: z.string()
            .min(10, "adaptability must be at least 10 characters for meaningful feedback")
            .max(300, "adaptability must be at most 300 characters"),
    }),

    domainSpecificInsight: z.object({
        depth: z.string()
            .min(10, "depth must be at least 10 characters for meaningful feedback")
            .max(300, "depth must be at most 300 characters"),
        industryAwareness: z.string()
            .min(10, "industryAwareness must be at least 10 characters for meaningful feedback")
            .max(300, "industryAwareness must be at most 300 characters"),
    }),

    communicationSkills: z.string()
        .min(10, "communicationSkills must be at least 10 characters for meaningful feedback")
        .max(400, "communicationSkills must be at most 400 characters"),

    recommendedPractice: z.array(
        z.string()
            .min(5, "Each practice recommendation must be at least 5 characters")
            .max(200, "Each practice recommendation must be at most 200 characters")
    )
        .min(1, "recommendedPractice must contain at least 1 item")
        .max(5, "recommendedPractice must contain at most 5 items")
        .refine(arr => new Set(arr).size === arr.length, "recommended practices must not contain duplicates"),
}).strict();

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    apiKey: process.env.GOOGLE_API_KEY,
}).withStructuredOutput(InterviewSummarySchema);

async function chatnode(state, config) {
    const { messages } = state;
    const { userId } = config.configurable;

    const formattedMessages = messages
        .filter(msg => msg instanceof HumanMessage || msg instanceof AIMessage)
        .map(msg => ({
            role: msg instanceof HumanMessage ? "user" : "assistant",
            content: msg.content,
        }));

    const allMemoryChunks = await retriveAllMemory(userId);

    let relevantMemory = "";
    for (const mem of allMemoryChunks.results) {
        relevantMemory += `Memory: ${mem.memory}\n`;
    }

    let wholeConversation = "";
    for (const message of formattedMessages) {
        wholeConversation += `${message.role}: ${message.content}\n`;
    }

    const systemPrompt = `
        You are an AI interviewer assistant generating a detailed, structured interview feedback summary for a candidate.  
        Use the conversation memories and whole conversation below to produce the summary.  

        Conversation Memory:
        ${relevantMemory}

        Whole Conversation:
        ${wholeConversation}

        Your goal:
        - Provide an objective, concise, and actionable assessment.
        - Maintain a professional and supportive tone.
        - Use clear examples derived from the conversation.
        - Avoid generic praise — every point must relate to specific behaviors or answers.

        Your summary must include:

        1. Overall Performance
            - Provide a balanced, high-level evaluation blending praise with constructive feedback.
            - Summarize how well the candidate met expectations for the role and interview format.
            - Mention strengths in delivery, content, and interpersonal skills, as well as noticeable improvement areas.
            - Keep it specific and actionable, avoiding vague praise.
            - Tie feedback to real moments from the interview if possible.

            Examples:
            - "You presented your ideas with clarity and confidence, demonstrating strong analytical thinking. However, at times, your answers became overly detailed, which slightly diluted the main point."
            - "You showcased strong technical expertise and relevant industry knowledge. Incorporating more real-world examples could further strengthen your impact."
            - "You engaged well with the interviewer, maintained composure, and communicated effectively under pressure. Working on structuring your answers with a clear beginning, middle, and end will make them even more impactful."
            - "You demonstrated strong problem-solving skills and adaptability when challenged with follow-up questions. To enhance your performance, ensure each answer stays tightly focused on the question asked."
            - "Your enthusiasm and energy created a positive impression, and your technical insights were solid. A bit more emphasis on measurable results from past experiences could boost credibility."

        2. Title
            - Clearly state the role or type of interview.
            - Include the position level (e.g., Junior, Mid-Level, Senior, Lead) if mentioned.
            - Specify the focus area (e.g., Technical, Behavioral, Case Study, Mixed).
            - If relevant, mention the industry or specialization (e.g., Healthcare, FinTech, AI Research).
            - Ensure it is concise and professional.

            Examples:
            - "Full-Stack Developer — Senior Technical Interview"
            - "Product Manager — Behavioral & Strategy Interview"
            - "Data Scientist — Machine Learning Technical Round"
            - "UX Designer — Portfolio Presentation & Feedback Session"
            - "DevOps Engineer — CI/CD and Cloud Architecture Interview"
            - "AI Researcher — Deep Learning Theory & Application Round"

        3. Score
            - Provide a single numerical score out of 10 (e.g., 8.6).
            - The score should reflect the candidate's overall performance across all criteria (technical ability, communication, adaptability, confidence, etc.).
            - Use decimals for more precision (e.g., 7.4, 9.1).
            - Avoid perfect 10s unless the performance was truly exceptional and left no room for improvement.
            - Consider balancing technical and soft skills in the scoring judgment.
            - Ensure the score aligns with the qualitative feedback provided in other sections.

            Examples:
            - "9.2" — Exceptional, very strong performance in both technical and interpersonal areas.
            - "8.0" — Solid performance with a few noticeable improvement areas.
            - "6.5" — Moderate performance; some strengths but clear skill gaps.

        4. Rating
            - Provide a qualitative assessment of the candidate's overall performance.
            - Should match and be consistent with the numerical score given in "Score".
            - Use clear, professional terms that an interviewer might use in official feedback.
            - Keep it concise (1-3 words) while still conveying a meaningful impression.
            - Suggested scale:
                • "Outstanding" — Exceptional performance with virtually no improvement areas.
                • "Excellent" — Strong performance with only minor improvement areas.
                • "Very Good" — Above-average performance; capable but with room for growth.
                • "Good" — Solid baseline, meets expectations but needs development in some areas.
                • "Fair" — Below expectations in some key areas; significant improvement needed.
                • "Needs Improvement" — Major gaps in required skills or approach.
                • "Poor Performance" — Did not meet basic requirements for the role.

            Examples:
            - Excellent
            - Very Good
            - Needs Improvement

        5. Section Scores
            - Provide individual numerical scores out of 10 for key interview categories.
            - Use decimals (e.g., 8.5, 7.8) for more precision.
            - Scores should reflect performance in that specific category alone, independent of other categories.
            - Ensure the category definitions are applied consistently:
                • Behavioral — Ability to demonstrate soft skills, culture fit, past experiences, teamwork, conflict resolution, and adaptability.
                • Technical — Depth and accuracy of technical or domain-specific knowledge, problem-solving in the technical space, ability to handle technical challenges.
                • Communication — Clarity, structure, vocabulary, tone, active listening, and engagement during the interview.
            - The scoring should align logically with the qualitative feedback in other sections (e.g., high Communication score should correlate with positive communication feedback).
            - Avoid giving a perfect 10 unless the candidate showed outstanding mastery with no observable improvement areas.

            Examples:
            Behavioral: 8.5 — Strong team-oriented mindset and adaptability, with minor scope for more concise storytelling.
            Technical: 8.0 — Solid technical problem-solving and relevant expertise, but some answers could use deeper detail.
            Communication: 8.4 — Clear, confident delivery and good vocabulary; could refine pacing for maximum impact.

            Output Format:
            {
                "behavioral": 8.5,
                "technical": 8.0,
                "communication": 8.4
            }

        6. Key Strengths
            - Identify 3-5 key positive aspects observed in the candidate's performance.
            - These should be specific, meaningful, and clearly relevant to the role.
            - Highlight behaviors, skills, and traits that had the most positive impact on their interview.
            - Use strong, positive wording and avoid vague phrases like "good" or "nice".
            - Can combine multiple qualities into one point if they are closely related.
            - Select from or adapt the following examples, ensuring they match the interview context:
                • Clear and concise communication — Ideas expressed logically and without unnecessary complexity.
                • Strong technical knowledge — Demonstrates mastery of key tools, frameworks, or concepts relevant to the role.
                • Problem-solving mindset — Approaches challenges methodically, explores alternatives, and offers practical solutions.
                • Adaptability — Adjusts answers smoothly when probed or when scenarios change.
                • Industry awareness — Shows understanding of current trends, market challenges, and emerging technologies.
                • Collaborative attitude — Engages constructively, demonstrates team-oriented thinking.
                • Confidence under pressure — Maintains composure and clarity in high-stakes or unexpected questions.
                • Analytical thinking — Breaks down problems into clear components and draws logical conclusions.
                • Practical experience — Relates real-world examples that demonstrate applied skills.
                • Quick learning ability — Understands and processes new concepts or requirements rapidly.
                • Strategic thinking — Considers long-term implications and aligns answers with business objectives.
                • Creativity & innovation — Brings fresh, original ideas to problem-solving.
                • Empathy & user focus — Considers end-user needs in technical or product decisions.

            Example Outputs:
            - ["Clear and concise communication", "Strong technical knowledge", "Analytical thinking", "Confidence under pressure"]
            - ["Collaborative attitude", "Industry awareness", "Quick learning ability", "Adaptability"]
            - ["Strategic thinking", "Problem-solving mindset", "Creativity & innovation", "Practical experience"]

        7. Areas for Improvement
            - Identify 2-4 clear, specific, and actionable areas where the candidate could improve.
            - Avoid vague or generic statements like "needs to improve communication" — instead, explain how.
            - Prioritize the most impactful improvements for this candidate based on the interview context.
            - Use constructive, professional wording that motivates growth rather than discourages.
            - Tie each point to a skill, behavior, or knowledge gap observed during the interview.
            - Where possible, suggest the type of adjustment that would address the issue (e.g., "use STAR method", "prepare industry-specific examples").
            - Examples of well-written improvement points:
                • "Could structure answers more clearly using a beginning-middle-end approach."
                • "Should include more data-driven examples to strengthen the impact of responses."
                • "Needs to pause briefly before answering to ensure concise and focused responses."
                • "Could benefit from reviewing recent industry trends to provide more up-to-date insights."
                • "Should work on breaking down complex technical explanations for non-technical audiences."
                • "Would benefit from practicing live problem-solving under time pressure to improve speed and accuracy."

            Example Outputs:
            - ["Could structure answers more clearly using STAR format", "Needs to provide more data-driven examples", "Should work on simplifying complex technical explanations"]
            - ["Could improve pacing to avoid rushing through key points", "Would benefit from more targeted preparation on emerging industry trends"]

        8. Listening & Adaptability
            - Assess two key aspects:
                1. Answered Exactly — Did the candidate respond directly to what was asked, without drifting into unrelated or unnecessary details?
                2. Adaptability — How well did they adjust their response when the interviewer probed further, rephrased a question, or introduced new information?
            - Provide specific, observation-based feedback for each subcategory.
            - Be fair and balanced — highlight both strengths and improvement points where applicable.
            - Consider:
                • Listening cues — Did they confirm understanding before answering?
                • Relevance — Did they stay on topic and avoid over-elaboration?
                • Flexibility — Were they able to pivot when the interviewer changed direction?
                • Clarification — Did they ask questions when unsure?
            - Avoid overly generic feedback like "listened well" — instead, describe behaviors and examples.
            
            Example Outputs:
            {
                "answeredExactly": "Consistently addressed the core of each question, though some answers included minor tangential details.",
                "adaptability": "Handled follow-up probes well, refining and expanding answers to address specific points raised by the interviewer."
            },
            {
                "answeredExactly": "Generally stayed on topic but occasionally provided overly long background context before answering directly.",
                "adaptability": "Initially struggled when questions shifted but recovered by reframing responses to match the interviewer's intent."
            },
            {
                "answeredExactly": "Answered directly and succinctly in most cases, showing strong focus on the interviewer's request.",
                "adaptability": "Demonstrated high flexibility, seamlessly adjusting examples when the discussion moved to different scenarios."
            }

        9. Domain-Specific Insight
            - Evaluate the candidate's expertise and awareness within the relevant technical, business, or industry domain.
            - Assess two dimensions:
                1. Depth — The level of mastery, accuracy, and application of domain knowledge demonstrated during the interview.
                2. Industry Awareness — Understanding of current trends, emerging practices, competitive landscape, and role-relevant innovations.
            - Ensure feedback reflects observable evidence from the candidate's responses — avoid generic praise without examples.
            - Consider:
                • Did they use accurate terminology and concepts without misstatements?
                • Could they explain complex domain topics clearly and precisely?
                • Did they reference relevant tools, frameworks, processes, or methodologies?
                • Were they able to connect their answers to real-world or industry-specific contexts?
                • Did they show awareness of emerging trends and potential future developments?
            - Keep feedback balanced — even strong performers may have gaps worth noting.

            Example Outputs:
            {
                "depth": "Demonstrated a strong understanding of distributed systems, microservices architecture, and API design principles, referencing both theory and practical implementation experience.",
                "industryAwareness": "Well-informed on current cloud-native adoption trends and DevOps automation practices, with thoughtful commentary on their future evolution."
            },
            {
                "depth": "Solid grasp of core financial analysis methods but limited exposure to newer fintech regulatory requirements.",
                "industryAwareness": "Aware of major shifts in payment systems but missed mentioning recent advancements in blockchain-based settlement solutions."
            },
            {
                "depth": "Showed comprehensive expertise in machine learning model optimization, citing recent academic approaches and real-world performance improvements.",
                "industryAwareness": "Strong awareness of AI ethics debates, regulatory changes, and competitive trends shaping the market."
            }

        10. Communication Skills
            - Evaluate the candidate's ability to convey ideas effectively, both in spoken and non-verbal communication (if applicable).
            - Focus on:
                1. Clarity — Were ideas expressed in a way that was easy to understand, avoiding unnecessary jargon unless contextually relevant?
                2. Structure — Did answers follow a logical sequence (e.g., situation → action → result), making them easy to follow?
                3. Vocabulary — Was language appropriate for the audience, demonstrating a balance between technical precision and accessibility?
                4. Engagement — Did they maintain interest, vary tone, use relevant examples, and check for understanding?
            - Consider whether they:
                • Used concise and relevant explanations without rambling.
                • Adapted their language to technical or non-technical listeners.
                • Used real-world analogies or examples to make complex concepts more relatable.
                • Demonstrated active listening by responding directly to cues from the interviewer.
            - Feedback should highlight both strengths and opportunities for refinement.
            
            Example Outputs:
            "Explained technical concepts with clarity, using structured, concise responses and relatable examples tailored to the interviewer's expertise."
            "Maintained logical flow and strong vocabulary, though occasionally overused technical jargon without ensuring the interviewer's understanding."
            "Engaging communicator who balanced technical detail with accessibility, but could improve pacing to avoid speaking too quickly."

        11. Recommended Practice
            - Provide one actionable, measurable tip per category: Behavioral, Technical, Communication.

            Example Output:
            {
                "behavioralPractice": "Prepare 3 STAR stories highlighting conflict resolution and leadership under pressure.",
                "technicalPractice": "Complete 3 timed estimation exercises weekly (≤5 mins each) to improve structured thinking.",
                "communicationPractice": "Conduct 2 mock interviews per week with peer feedback on clarity and pacing."
            }

        Formatting Requirements:
            - Always return output as valid JSON.
            - Use exactly the following keys in the specified order and structure:
            {
            "overallPerformance": "One concise paragraph summarizing the candidate's general interview performance.",
            "title": "Exact role or type of interview (e.g., 'Full-Stack Developer Technical Interview').",
            "score": "Numerical overall score out of 10 (e.g., '8.6').",
            "rating": "One-word qualitative rating (e.g., 'Excellent', 'Very Good', 'Good', 'Needs Improvement').",
            "strengths": ["2-3 short phrases highlighting key strengths."],
            "areasOfImprovement": ["2-3 short phrases outlining improvement areas."],
            "listeningAdaptability": {
                "answeredExactly": "Brief observation on whether they answered exactly what was asked.",
                "adaptability": "Brief observation on how well they adapted to follow-up or probing questions."
            },
            "domainSpecificInsight": {
                "depth": "One sentence on depth of technical/business knowledge.",
                "industryAwareness": "One sentence on awareness of relevant industry trends."
            },
            "communicationSkills": "One sentence on clarity, structure, vocabulary, and engagement.",
            "confidenceBodyLanguage": "One sentence on tone, posture, and composure.",
            "recommendedPractice": ["3-5 short, actionable improvement tips."]
            }

        Ensure:
        - Each section is personalized using details from the conversation.
        - Avoid vague terms like "good" or "bad" without context.
        - Recommended practices must be directly linked to weaknesses or areas for growth.
        - Strengths must reflect actual performance observed in the conversation.
        - If the conversation contains no interview content or if conversation not happen between AI model and user then give bad review.
    `;

    const structuredResponse = await llm.invoke([systemPrompt]);

    // Wrap the structured output in an AIMessage
    const aiMessage = new AIMessage({
        content: JSON.stringify(structuredResponse, null, 2)
    });

    return { messages: [aiMessage] }
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

export async function interviewSummary(req, res) {
    try {
        const { userId, message } = req.body;
        if (!userId || !message) {
            return res.status(400).json({ error: "userId and message are required" });
        }

        await client.connect();
        const graph = graphBuilder();

        let config = { configurable: { thread_id: `session-${userId}`, userId } };

        let state = { messages: [new HumanMessage(message)] }

        const { messages: updatedMessages } = await graph.invoke(state, config);

        const summaryContent = JSON.parse(updatedMessages.at(-1).content);

        res.json({
            success: true,
            reply: summaryContent
        });
    } catch (error) {
        console.error("Interview agent error:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await client.close();
    }
}