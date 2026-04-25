import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Loader2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/store/session";
import { SAMPLE_JD, SAMPLE_RESUME } from "@/lib/samples";
import { extractPdfText } from "@/lib/pdfParse";

const Assess = () => {
  const nav = useNavigate();
  const { jobDescription, resume, extraction, setInputs, setExtraction, setTranscript, setEvaluation } = useSession();

  const [jd, setJd] = useState(jobDescription);
  const [cv, setCv] = useState(resume);
  const [loading, setLoading] = useState(false);

  // ✅ Clear all data with confirmation
  const handleClearAll = () => {
    if (!confirm("Are you sure you want to clear all data?")) return;

    setJd("");
    setCv("");
    setInputs("", "");
    setExtraction(null);
    setTranscript([]);
    setEvaluation(null);

    toast.success("All data cleared");
  };

  const onAnalyze = async () => {
    if (jd.trim().length < 50 || cv.trim().length < 50) {
      toast.error("Please paste a more complete JD and resume (50+ characters each).");
      return;
    }
    setLoading(true);
    setInputs(jd, cv);
    setTranscript([]);
    setEvaluation(null);
    try {
      const { data, error } = await supabase.functions.invoke("extract-skills", {
        body: { jobDescription: jd, resume: cv },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setExtraction(data);
      toast.success("Skills extracted. Ready for the interview.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to extract skills");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setJd(SAMPLE_JD);
    setCv(SAMPLE_RESUME);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Start your assessment</h1>
          <p className="mt-2 text-muted-foreground">
            Paste a job description and your resume. We'll extract skills and prepare an adaptive interview.
          </p>
        </div>

        {/* Buttons Row */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadSample}>
            Try with sample data
          </Button>

          {/* ✅ Purple Gradient Clear Button */}
          <Button
            size="sm"
            onClick={handleClearAll}
            className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
          >
            <Trash className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputCard
          icon={<Briefcase className="h-5 w-5" />}
          title="Job Description"
          placeholder="Paste the JD here — role, responsibilities, required tech, experience…"
          value={jd}
          onChange={setJd}
        />
        <InputCard
          icon={<FileText className="h-5 w-5" />}
          title="Candidate Resume"
          placeholder="Paste your resume — skills, projects, experience…"
          value={cv}
          onChange={setCv}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          onClick={onAnalyze}
          disabled={loading}
          className="bg-gradient-primary shadow-elegant transition-smooth hover:shadow-glow"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing skills…
            </>
          ) : (
            <>
              Extract & Compare Skills <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">Know What You Know Precisely with SkillLens by Catalyst AI.</p>
      </div>

      {extraction && (
        <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Detected role</div>
            <h2 className="mt-1 text-2xl font-semibold">{extraction.jobTitle || "Target role"}</h2>
            {extraction.experienceSummary && (
              <p className="mt-2 text-sm text-muted-foreground">{extraction.experienceSummary}</p>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Skill comparison</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {extraction.requiredSkills.map((s) => (
                <SkillRow key={s.name} s={s} />
              ))}
            </div>
          </div>

          {extraction.candidateExtraSkills.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Bonus skills you bring</h3>
              <div className="flex flex-wrap gap-2">
                {extraction.candidateExtraSkills.map((s) => (
                  <Badge key={s} variant="secondary" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => nav("/chat")} className="bg-gradient-primary shadow-elegant">
              Start interview <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const InputCard = ({
  icon,
  title,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setParsing(true);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) {
        toast.error("No text found in PDF. It may be a scanned image.");
        return;
      }
      onChange(text);
      toast.success(`Loaded ${file.name} (${text.length} chars)`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to parse PDF");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-card p-5 shadow-soft transition-smooth hover:shadow-elegant ${
        dragOver ? "border-primary bg-accent/40" : "border-border/60"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{value.length} chars</span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={parsing}
            onClick={() => inputRef.current?.click()}
            className="h-7 gap-1.5 px-2 text-xs"
          >
            {parsing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {parsing ? "Parsing…" : "Upload PDF"}
          </Button>
        </div>
      </div>
      <Textarea
        placeholder={`${placeholder}\n\nOr drag & drop a PDF here.`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[260px] resize-none border-border/60 bg-background/60 text-sm"
      />
    </div>
  );
};

const SkillRow = ({ s }: { s: import("@/lib/types").RequiredSkill }) => {
  const cfg =
    s.status === "match"
      ? { Icon: CheckCircle2, color: "text-success", bg: "bg-success/10" }
      : s.status === "partial"
      ? { Icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" }
      : { Icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
        <cfg.Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{s.name}</div>
          {s.importance === "critical" && (
            <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">
              Critical
            </Badge>
          )}
        </div>
        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.evidence}</div>
      </div>
    </div>
  );
};

export default Assess;