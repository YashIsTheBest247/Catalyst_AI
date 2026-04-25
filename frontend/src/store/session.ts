import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionState, SkillExtraction, ChatMessage, Evaluation } from "@/lib/types";

interface Store extends SessionState {
  setInputs: (jd: string, resume: string) => void;
  setExtraction: (e: SkillExtraction | null) => void;
  setTranscript: (t: ChatMessage[]) => void;
  appendMessage: (m: ChatMessage) => void;
  updateLastAssistant: (content: string) => void;
  setEvaluation: (e: Evaluation | null) => void;
  reset: () => void;
}

const initial: SessionState = {
  jobDescription: "",
  resume: "",
  extraction: null,
  transcript: [],
  evaluation: null,
};

export const useSession = create<Store>()(
  persist(
    (set) => ({
      ...initial,
      setInputs: (jobDescription, resume) => set({ jobDescription, resume }),
      setExtraction: (extraction) => set({ extraction }),
      setTranscript: (transcript) => set({ transcript }),
      appendMessage: (m) => set((s) => ({ transcript: [...s.transcript, m] })),
      updateLastAssistant: (content) =>
        set((s) => {
          const t = [...s.transcript];
          const last = t[t.length - 1];
          if (last?.role === "assistant") {
            t[t.length - 1] = { ...last, content };
          } else {
            t.push({ role: "assistant", content });
          }
          return { transcript: t };
        }),
      setEvaluation: (evaluation) => set({ evaluation }),
      reset: () => set({ ...initial }),
    }),
    { name: "skilllens-session" }
  )
);