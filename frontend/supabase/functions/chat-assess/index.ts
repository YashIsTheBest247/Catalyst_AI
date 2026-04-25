import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, skills, jobTitle } = await req.json();
    const API_KEY = Deno.env.get("API_KEY");
    if (!API_KEY) throw new Error("API_KEY missing");

    const skillList = (skills || []).map((s: any) => `- ${s.name} (${s.importance}, current status: ${s.status})`).join("\n");

    const systemPrompt = `You are Catalyst AI, an expert technical interviewer assessing a candidate for the role: ${jobTitle || "the target role"}.

Skills to assess (cover them roughly in priority order, weighting critical first):
${skillList}

Rules:
- Ask ONE focused question at a time. Mix conceptual, practical, and scenario-based.
- Adapt difficulty based on the candidate's previous answer. If they answered well, go deeper; if shallow, probe with a follow-up before moving on.
- Cover roughly 1-2 questions per critical skill, then 1 per secondary skill. Aim for ~8–12 questions total.
- Be friendly, concise, and professional. No long preambles.
- When you have enough signal across all skills, end with EXACTLY this token on its own line: [ASSESSMENT_COMPLETE]
  Then write a one-line thank-you. Do not score skills here — scoring happens separately.
- Never repeat a question already asked.
- Format with markdown when useful (code blocks for code).`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-assess error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});