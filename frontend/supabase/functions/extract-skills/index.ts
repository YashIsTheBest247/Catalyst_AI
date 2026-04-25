import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobDescription, resume } = await req.json();
    if (!jobDescription || !resume) {
      return new Response(JSON.stringify({ error: "Missing jobDescription or resume" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const API_KEY = Deno.env.get("API_KEY");
    if (!API_KEY) throw new Error("API_KEY missing");

    const systemPrompt = `You are a senior technical recruiter and skill analyst. Extract and compare skills from a Job Description (JD) and a Candidate Resume.
Return ONLY structured data via the provided tool. Be concise and concrete (e.g. "React", "PostgreSQL", "OAuth2", "System Design"). Avoid duplicates and overly generic items like "communication".
Match logic:
- "match": skill clearly demonstrated in resume with evidence (project, role, years).
- "partial": mentioned but shallow / adjacent technology / unclear depth.
- "missing": required by JD but absent from resume.`;

    const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resume}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`, // 
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
              name: "report_skills",
              description: "Return extracted skills and comparison.",
              parameters: {
                type: "object",
                properties: {
                  jobTitle: { type: "string", description: "Inferred job title from JD" },
                  candidateName: { type: "string", description: "Candidate name if found, else empty" },
                  requiredSkills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        importance: { type: "string", enum: ["critical", "secondary"] },
                        status: { type: "string", enum: ["match", "partial", "missing"] },
                        evidence: { type: "string", description: "Short evidence from resume or 'Not found'" },
                      },
                      required: ["name", "importance", "status", "evidence"],
                      additionalProperties: false,
                    },
                  },
                  candidateExtraSkills: {
                    type: "array",
                    items: { type: "string" },
                    description: "Skills the candidate has that are not required by the JD",
                  },
                  experienceSummary: { type: "string" },
                },
                required: ["jobTitle", "candidateName", "requiredSkills", "candidateExtraSkills", "experienceSummary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_skills" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    console.error("extract-skills error:", e);

    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});