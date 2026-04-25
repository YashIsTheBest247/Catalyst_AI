import { callAI, mapAiError } from "../aiClient.js";

const tool = {
  type: "function",
  function: {
    name: "report_evaluation",
    description: "Return scores and learning plan.",
    parameters: {
      type: "object",
      properties: {
        overallReadiness: { type: "number" },
        summary: { type: "string" },
        scores: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              importance: { type: "string", enum: ["critical", "secondary"] },
              currentLevel: { type: "string", enum: ["none", "beginner", "intermediate", "advanced"] },
              targetLevel: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
              score: { type: "number" },
              notes: { type: "string" },
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
              title: { type: "string" },
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
              estimatedTime: { type: "string" },
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
};

export async function generatePlanHandler(req, res) {
  try {
    const { jobTitle, skills, transcript } = req.body || {};

    const transcriptText = (transcript || [])
      .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
      .join("\n");

    const skillList = (skills || [])
      .map((s) => `- ${s.name} (${s.importance}, jd-vs-resume: ${s.status}, evidence: ${s.evidence})`)
      .join("\n");

    const systemPrompt = `You are Catalyst AI's evaluator and learning coach. Based on the assessment transcript, score each required skill and produce a realistic personalized learning plan for the role: ${jobTitle || "the target role"}.

Required skills:
${skillList}

Scoring rubric:
- "advanced": deep understanding, gives concrete examples, handles trade-offs and edge cases.
- "intermediate": solid working knowledge, can build/maintain features, some gaps in depth.
- "beginner": surface-level knowledge, struggles with practical scenarios.
- "none": couldn't demonstrate or explicitly admitted lack of knowledge.

Then create a phased learning plan covering the weakest critical skills first. Provide REAL, well-known resources (YouTube channels, official docs, freeCodeCamp, MDN, etc.) — never invent URLs you aren't sure of; use the canonical homepage if unsure (e.g. https://react.dev). Keep weeksTotal realistic (4-12 weeks).`;

    const aiRes = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `ASSESSMENT TRANSCRIPT:\n${transcriptText}` },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_evaluation" } },
    });

    if (!aiRes.ok) {
      const err = mapAiError(aiRes.status);
      console.error("AI error", aiRes.status, await aiRes.text());
      return res.status(err.status).json({ error: err.message });
    }

    const data = await aiRes.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    res.json(JSON.parse(toolCall.function.arguments));
  } catch (e) {
    console.error("generate-plan error:", e);
    res.status(500).json({ error: e instanceof Error ? e.message : "Unknown" });
  }
}