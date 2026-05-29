import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export const generateWeeklyInsight = async (summary: object): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
You are a productivity coach for a developer.

Here is their weekly coding and project data:
${JSON.stringify(summary, null, 2)}

Give a short, actionable analysis covering:
1. Strengths this week
2. Areas to improve
3. One specific suggestion for next week

Keep it under 150 words. Be direct and encouraging.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
};