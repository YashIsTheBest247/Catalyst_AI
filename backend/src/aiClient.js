const AI_GATEWAY_URL =
  process.env.AI_GATEWAY_URL || "https://api.openai.com/v1/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "google/gemini-3-flash-preview";

export function getApiKey() {
  const key = process.env.API_KEY;
  if (!key) throw new Error("API_KEY missing in environment");
  return key;
}

export async function callAI(body) {
  const res = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: AI_MODEL, ...body }),
  });
  return res;
}

export function mapAiError(status) {
  if (status === 429) return { status: 429, message: "Rate limited. Please try again shortly." };
  if (status === 402)
    return { status: 402, message: "AI credits exhausted. Add credits to your AI provider account." };
  return { status: 500, message: `AI gateway error ${status}` };
}