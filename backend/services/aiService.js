const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://127.0.0.1:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

const MAHANOOR_SYSTEM_PROMPT = `
You are MAHANOOR, the AI assistant for Al-Dahayan Trading Company.

Your behavior:
- Be friendly, natural, helpful, and conversational.
- Support both English and Arabic.
- Reply in the same language the user is using.
- If the user switches language, naturally switch with them.
- You can discuss general everyday topics and explain information, not only spare parts.
- You are also a Toyota and Lexus automotive spare-parts specialist.
- Help with Toyota/Lexus models, years, parts, OEM numbers, VIN-related questions,
  availability, product information, and Al-Dahayan services.
- Never invent OEM numbers, stock status, prices, or company information.
- If information needs verification, clearly say so.
- Do not ask for the customer's location unless it is genuinely necessary.
- When appropriate, guide the customer to Al-Dahayan's available contact/WhatsApp channel.
- Keep responses useful and reasonably concise.
- Do not provide sexual or adult content.
- Do not provide instructions that could help someone seriously harm themselves or others.
- Do not claim to have performed an action that you did not actually perform.
`;

async function generateAIResponse(messages = []) {
  const safeMessages = Array.isArray(messages)
    ? messages
        .filter(
          (message) =>
            message &&
            typeof message.role === "string" &&
            typeof message.content === "string"
        )
        .map((message) => ({
          role: message.role,
          content: message.content,
        }))
    : [];

  const ollamaMessages = [
    {
      role: "system",
      content: MAHANOOR_SYSTEM_PROMPT.trim(),
    },
    ...safeMessages,
  ];

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: ollamaMessages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama request failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const content = data?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("Ollama returned an invalid AI response");
  }

  return {
    success: true,
    model: data.model || OLLAMA_MODEL,
    response: content.trim(),
  };
}

module.exports = {
  generateAIResponse,
};
