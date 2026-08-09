export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,POST"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // Handle preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only POST allowed
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const {
            prompt,
            systemPrompt,
            messages = []
        } = req.body || {};

        if (!prompt) {
            return res.status(400).json({
                error: "Prompt is required"
            });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GROQ_API_KEY is not configured"
            });
        }

        // Default StudyVerse system prompt
        const defaultSystemPrompt = `
You are StudyVerse AI, a friendly, intelligent and helpful learning assistant.

Your job is to help students understand concepts, practice questions,
revise topics and learn effectively.

IMPORTANT CONVERSATION RULES:
- Remember the conversation history provided to you.
- Always maintain the current topic unless the student clearly changes it.
- If the student says "this topic", "this", "it", "above",
  "previous question", or similar words, refer to the most recent
  relevant topic in the conversation.
- NEVER randomly switch subjects.
- If the current topic is Human Heart and the student asks for
  practice questions, generate Human Heart questions.
- If the student asks about a previous question, use the conversation
  history to understand which question they mean.

LEARNING STYLE:
- Explain concepts clearly and simply.
- Be friendly and conversational.
- Adapt explanations to a student.
- Use examples when useful.
- Encourage understanding instead of simply giving answers.
- For practice questions, keep them related to the current topic.
- For follow-up questions, continue from the previous context.

RESPONSE FORMATTING:
- Use Markdown when useful.
- Use headings for sections.
- Use numbered lists for questions.
- Use bullet points for explanations.
- Use bold text for important terms.
- Do not put the entire response inside a code block.

IMPORTANT:
Never change the subject randomly.
Stay focused on the student's current learning topic.
`;

        /*
         * Build conversation.
         *
         * We keep the previous messages sent by the frontend
         * and add the current user prompt.
         */

        const conversationMessages = [];

        conversationMessages.push({
            role: "system",
            content: systemPrompt || defaultSystemPrompt
        });

        // Add previous conversation
        if (Array.isArray(messages)) {
            for (const message of messages) {
                if (
                    message &&
                    (message.role === "user" ||
                        message.role === "assistant") &&
                    typeof message.content === "string"
                ) {
                    conversationMessages.push({
                        role: message.role,
                        content: message.content
                    });
                }
            }
        }

        // Add current prompt only if it is not already the last message
        const lastMessage =
            conversationMessages[conversationMessages.length - 1];

        if (
            !lastMessage ||
            lastMessage.role !== "user" ||
            lastMessage.content !== prompt
        ) {
            conversationMessages.push({
                role: "user",
                content: prompt
            });
        }

        // Groq API
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: conversationMessages,
                    temperature: 0.7,
                    max_tokens: 1500
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq Error:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Groq API request failed"
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Backend Error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
