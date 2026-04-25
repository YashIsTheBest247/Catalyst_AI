export type SkillStatus = "match" | "partial" | "missing";
export type Importance = "critical" | "secondary";
export type SkillLevel = "none" | "beginner" | "intermediate" | "advanced";

export interface RequiredSkill {
  name: string;
  importance: Importance;
  status: SkillStatus;
  evidence: string;
}

export interface SkillExtraction {
  jobTitle: string;
  candidateName: string;
  requiredSkills: RequiredSkill[];
  candidateExtraSkills: string[];
  experienceSummary: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SkillScore {
  name: string;
  importance: Importance;
  currentLevel: SkillLevel;
  targetLevel: Exclude<SkillLevel, "none">;
  score: number;
  notes: string;
}

export interface Gap {
  skill: string;
  severity: Importance;
  reason: string;
}

export interface Phase {
  title: string;
  focus: string;
  skills: string[];
}

export interface Resource {
  type: "video" | "docs" | "practice" | "course" | "book";
  title: string;
  url: string;
}

export interface SkillPlan {
  skill: string;
  whyItMatters: string;
  estimatedTime: string;
  resources: Resource[];
}

export interface Evaluation {
  overallReadiness: number;
  summary: string;
  scores: SkillScore[];
  gaps: Gap[];
  weeksTotal: number;
  phases: Phase[];
  skillPlans: SkillPlan[];
  recommendations: string[];
}

export interface SessionState {
  jobDescription: string;
  resume: string;
  extraction: SkillExtraction | null;
  transcript: ChatMessage[];
  evaluation: Evaluation | null;
}