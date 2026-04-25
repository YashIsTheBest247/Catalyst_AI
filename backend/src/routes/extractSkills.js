import { callAI, mapAiError } from "../aiClient.js";

const systemPrompt = `You are a senior technical recruiter and skill analyst. Extract and compare skills from a Job Description (JD) and a Candidate Resume.
Return ONLY structured data via the provided tool. Be concise and concrete (e.g. "React", "PostgreSQL", "OAuth2", "System Design"). Avoid duplicates and overly generic items like "communication".
Match logic:
- "match": skill clearly demonstrated in resume with evidence (project, role, years).
- "partial": mentioned but shallow / adjacent technology / unclear depth.
- "missing": required by JD but absent from resume.`;

const tool = {
  type: "function",
  function: {
    name: "report_skills",
    description: "Return extracted skills and comparison.",
    parameters: {
      type: "object",
      properties: {
        jobTitle: { type: "string" },
        candidateName: { type: "string" },
        requiredSkills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              importance: { type: "string", enum: ["critical", "secondary"] },
              status: { type: "string", enum: ["match", "partial", "missing"] },
              evidence: { type: "string" },
            },
            required: ["name", "importance", "status", "evidence"],
            additionalProperties: false,
          },
        },
        candidateExtraSkills: { type: "array", items: { type: "string" } },
        experienceSummary: { type: "string" },
      },
      required: ["jobTitle", "candidateName", "requiredSkills", "candidateExtraSkills", "experienceSummary"],
      additionalProperties: false,
    },
  },
};

export async function extractSkillsHandler(req, res) {
  try {
    const { jobDescription, resume } = req.body || {};
    if (!jobDescription || !resume) {
      return res.status(400).json({ error: "Missing jobDescription or resume" });
    }

    const aiRes = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resume}` },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "report_skills" } },
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
    console.error("extract-skills error:", e);
    res.status(500).json({ error: e instanceof Error ? e.message : "Unknown" });
  }
}