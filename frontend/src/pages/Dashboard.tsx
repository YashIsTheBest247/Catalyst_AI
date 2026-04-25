import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Download, Target, TrendingUp, AlertTriangle, BookOpen, Video, FileText, Code2, GraduationCap, Library, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useSession } from "@/store/session";
import { exportToPDF } from "@/lib/pdf";
import type { Resource } from "@/lib/types";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const nav = useNavigate();
  const { evaluation, extraction } = useSession();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!evaluation) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-10 text-center shadow-soft">
        
        <h2 className="mt-4 text-xl font-semibold">No report yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Run an assessment to generate your scoring and personalized learning plan.
        </p>
        <Button className="mt-6 bg-gradient-primary" onClick={() => nav("/assess")}>
          Start assessment
        </Button>
      </div>
    );
  }

  const radarData = evaluation.scores.map((s) => ({ skill: s.name, score: s.score }));
  const matchedPct = extraction
    ? Math.round((extraction.requiredSkills.filter((s) => s.status === "match").length / Math.max(extraction.requiredSkills.length, 1)) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Report</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {extraction?.candidateName || "Candidate"} → {extraction?.jobTitle || "Target Role"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{evaluation.summary}</p>
        </div>
        <Button onClick={() => exportToPDF(reportRef.current!, `skilllens-report.pdf`)} className="bg-gradient-primary shadow-elegant">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div ref={reportRef} className="space-y-8 bg-background">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Overall readiness" value={`${evaluation.overallReadiness}%`} accent />
          <StatCard icon={<Target className="h-4 w-4" />} label="Skills matched (resume)" value={`${matchedPct}%`} />
          <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Skill gaps" value={`${evaluation.gaps.length}`} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card title="Skill proficiency">
            <div className="h-72">
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Per-skill scores">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={radarData} layout="vertical" margin={{ left: 20, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="skill" width={110} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <Card title="Skill breakdown">
          <div className="space-y-4">
            {evaluation.scores.map((s) => (
              <div key={s.name} className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="font-medium">{s.name}</div>
                  {s.importance === "critical" && (
                    <Badge variant="outline" className="border-primary/30 text-[10px] text-primary">Critical</Badge>
                  )}
                  <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{s.currentLevel}</span>
                    <span>→</span>
                    <span className="font-medium capitalize text-foreground">{s.targetLevel}</span>
                    <span className="font-semibold text-foreground">{s.score}%</span>
                  </div>
                </div>
                <Progress value={s.score} className="h-2" />
                {s.notes && <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p>}
              </div>
            ))}
          </div>
        </Card>

        {evaluation.gaps.length > 0 && (
          <Card title="Gap analysis">
            <div className="grid gap-3 sm:grid-cols-2">
              {evaluation.gaps.map((g) => (
                <div
                  key={g.skill}
                  className={cn(
                    "rounded-xl border p-4",
                    g.severity === "critical" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{g.skill}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        g.severity === "critical" ? "border-destructive/40 text-destructive" : "border-warning/40 text-warning"
                      )}
                    >
                      {g.severity === "critical" ? "Critical" : "Secondary"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{g.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title={`Personalized learning plan · ${evaluation.weeksTotal} weeks`}>
          <div className="space-y-3">
            {evaluation.phases.map((p, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{p.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.focus}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold">Per-skill resources</h3>
            {evaluation.skillPlans.map((sp) => (
              <div key={sp.skill} className="rounded-xl border border-border/60 bg-background/50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-semibold">{sp.skill}</div>
                  <div className="text-xs text-muted-foreground">{sp.estimatedTime}</div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{sp.whyItMatters}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {sp.resources.map((r, i) => (
                    <ResourceLink key={i} r={r} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {evaluation.recommendations.length > 0 && (
          <Card title="Recommendations">
            <ul className="space-y-2">
              {evaluation.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm">
               
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) => (
  <div
    className={cn(
      "rounded-2xl border border-border/60 p-5 shadow-soft transition-smooth",
      accent ? "bg-gradient-primary text-primary-foreground" : "bg-card"
    )}
  >
    <div className={cn("flex items-center gap-2 text-xs font-medium uppercase tracking-wider", accent ? "text-primary-foreground/80" : "text-muted-foreground")}>
      {icon} {label}
    </div>
    <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
  </div>
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
    <h2 className="mb-4 text-lg font-semibold">{title}</h2>
    {children}
  </div>
);

const ResourceLink = ({ r }: { r: Resource }) => {
  const Icon =
    r.type === "video" ? Video :
    r.type === "docs" ? FileText :
    r.type === "practice" ? Code2 :
    r.type === "course" ? GraduationCap :
    Library;
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3 transition-smooth hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{r.title}</div>
        <div className="truncate text-xs text-muted-foreground">{r.url}</div>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary" />
    </a>
  );
};

export default Dashboard;