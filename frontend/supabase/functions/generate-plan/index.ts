import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobTitle, skills, transcript } = await req.json();
    const API_KEY = Deno.env.get("API_KEY");
    if (!API_KEY) throw new Error("API_KEY missing");

    const transcriptText = (transcript || [])
      .map((m: any) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
      .join("\n");

    const skillList = (skills || []).map((s: any) => `- ${s.name} (${s.importance}, jd-vs-resume: ${s.status}, evidence: ${s.evidence})`).join("\n");

    const systemPrompt = `You are Catalyst AI's evaluator and learning coach. Based on the assessment transcript, score each required skill and produce a realistic personalized learning plan for the role: ${jobTitle || "the target role"}.

Required skills:
${skillList}

Scoring rubric:
- "advanced": deep understanding, gives concrete examples, handles trade-offs and edge cases.
- "intermediate": solid working knowledge, can build/maintain features, some gaps in depth.
- "beginner": surface-level knowledge, struggles with practical scenarios.
- "none": couldn't demonstrate or explicitly admitted lack of knowledge.

Then create a phased learning plan covering the weakest critical skills first. Provide REAL, well-known resources (YouTube channels, official docs, freeCodeCamp, MDN, etc.) — never invent URLs you aren't sure of; use the canonical homepage if unsure (e.g. https://react.dev). Keep weeksTotal realistic (4-12 weeks).`;

    const userPrompt = `ASSESSMENT TRANSCRIPT:\n${transcriptText}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_evaluation",
              description: "Return scores and learning plan.",
              parameters: {
                type: "object",
                properties: {
                  overallReadiness: { type: "number", description: "0-100 readiness score for the role" },
                  summary: { type: "string", description: "2-3 sentence summary of candidate's standing" },
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        importance: { type: "string", enum: ["critical", "secondary"] },
                        currentLevel: { type: "string", enum: ["none", "beginner", "intermediate", "advanced"] },
                        targetLevel: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                        score: { type: "number", description: "0-100 proficiency score" },
                        notes: { type: "string", description: "What they showed / where they fell short" },
                      },
                      required: ["name", "importance", "currentLevel", "targetLevel", "score", "notes"],
                      additionalProperties: false,
                    },
                  },
                  gaps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        severity: { type: "string", enum: ["critical", "secondary"] },
                        reason: { type: "string" },
                      },
                      required: ["skill", "severity", "reason"],
                      additionalProperties: false,
                    },
                  },
                  weeksTotal: { type: "number" },
                  phases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "e.g. 'Week 1–2: Fundamentals'" },
                        focus: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "focus", "skills"],
                      additionalProperties: false,
                    },
                  },
                  skillPlans: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        whyItMatters: { type: "string" },
                        estimatedTime: { type: "string", description: "e.g. '2-4 weeks'" },
                        resources: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["video", "docs", "practice", "course", "book"] },
                              title: { type: "string" },
                              url: { type: "string" },
                            },
                            required: ["type", "title", "url"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["skill", "whyItMatters", "estimatedTime", "resources"],
                      additionalProperties: false,
                    },
                  },
                  recommendations: { type: "array", items: { type: "string" } },
                },
                required: ["overallReadiness", "summary", "scores", "gaps", "weeksTotal", "phases", "skillPlans", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_evaluation" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const args = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});