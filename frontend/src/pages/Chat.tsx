import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, ArrowRight, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSession } from "@/store/session";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const COMPLETE_TOKEN = "[ASSESSMENT_COMPLETE]";

const Chat = () => {
  const nav = useNavigate();
  const { extraction, transcript, appendMessage, updateLastAssistant, setEvaluation, setTranscript } = useSession();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!extraction) {
      nav("/assess");
      return;
    }
    if (transcript.length === 0) {
      void startStream([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript, streaming]);

  useEffect(() => {
    const last = transcript[transcript.length - 1];
    if (last?.role === "assistant" && last.content.includes(COMPLETE_TOKEN)) {
      setCompleted(true);
    }
  }, [transcript]);

  const startStream = async (messages: ChatMessage[]) => {
    if (!extraction) return;
    setStreaming(true);
    appendMessage({ role: "assistant", content: "" });
    let acc = "";

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assess`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages,
          skills: extraction.requiredSkills,
          jobTitle: extraction.jobTitle,
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limited. Please wait a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add credits in workspace settings.");
        else toast.error("Failed to start interview");
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              updateLastAssistant(acc);
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection error");
    } finally {
      setStreaming(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    appendMessage(userMsg);
    setInput("");
    await startStream([...transcript, userMsg]);
  };

  const generateReport = async () => {
    if (!extraction) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plan", {
        body: { jobTitle: extraction.jobTitle, skills: extraction.requiredSkills, transcript },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEvaluation(data);
      toast.success("Your report is ready!");
      nav("/dashboard");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  if (!extraction) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Interview</h1>
          <p className="text-sm text-muted-foreground">
            Assessing for: <span className="font-medium text-foreground">{extraction.jobTitle}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setTranscript([]); setCompleted(false); void startStream([]); }}>
          Restart
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
        style={{ minHeight: "60vh", maxHeight: "70vh" }}
      >
        {transcript.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing your first question…
          </div>
        )}
        {transcript.map((m, i) => (
          <Bubble key={i} msg={m} streaming={streaming && i === transcript.length - 1 && m.role === "assistant"} />
        ))}
      </div>

      {completed ? (
        <div className="mt-5 rounded-2xl border border-border/60 bg-gradient-primary p-6 text-primary-foreground shadow-elegant">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            Assessment complete
          </div>
          <h3 className="mt-2 text-xl font-semibold">Generate your scoring & learning plan</h3>
          <p className="mt-1 text-sm text-primary-foreground/80">
            We'll analyze your answers, score each skill, and build a personalized roadmap.
          </p>
          <Button
            onClick={generateReport}
            disabled={generating}
            variant="secondary"
            size="lg"
            className="mt-4"
          >
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
            ) : (
              <>Generate report <ArrowRight className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex items-end gap-2">
          <Textarea
            placeholder="Type your answer…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            className="min-h-[60px] resize-none rounded-2xl border-border/60 bg-card shadow-soft"
            disabled={streaming}
          />
          <Button
            size="lg"
            onClick={() => void send()}
            disabled={streaming || !input.trim()}
            className="bg-gradient-primary shadow-elegant"
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};

const Bubble = ({ msg, streaming }: { msg: ChatMessage; streaming: boolean }) => {
  const isUser = msg.role === "user";
  const display = msg.content.replace(COMPLETE_TOKEN, "").trim();
  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-soft",
          isUser ? "bg-foreground text-background" : "bg-gradient-primary text-primary-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-soft",
          isUser ? "bg-primary text-primary-foreground" : "bg-background border border-border/60"
        )}
      >
        {display ? (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:bg-muted prose-pre:text-foreground">
            <ReactMarkdown>{display}</ReactMarkdown>
          </div>
        ) : (
          <TypingDots />
        )}
        {streaming && display && <span className="ml-1 inline-block h-3 w-1 animate-pulse-dot bg-primary align-middle" />}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex h-5 items-center gap-1">
    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
  </div>
);

export default Chat;