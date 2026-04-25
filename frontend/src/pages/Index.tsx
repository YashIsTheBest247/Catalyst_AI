import { Link } from "react-router-dom";
import { ArrowRight, FileText, MessageSquare, Target, Download, BarChart3, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: FileText, title: "Skill Extraction", desc: "Parse JD and resume to surface real skill alignment." },
  { icon: MessageSquare, title: "Conversational Assessment", desc: "Adaptive AI interviewer that probes depth, not buzzwords." },
  { icon: BarChart3, title: "Proficiency Scoring", desc: "Per-skill scores with clear current vs target levels." },
  { icon: Target, title: "Gap Analysis", desc: "Critical vs secondary gaps prioritized for the role." },
  { icon: BookOpen, title: "Personalized Plan", desc: "Phased weekly roadmap with curated learning resources." },
  { icon: Download, title: "Export & Share", desc: "Download a polished PDF of your plan and report." },
];

const Index = () => {
  return (
    <div className="space-y-24">
      <section className="relative -mt-10 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
           
            AI-powered skill assessment
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            See the skills behind the{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">resume</span>.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Catalyst AI evaluates real proficiency through adaptive interviews and turns gaps into a personalized
            learning plan with curated resources.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-primary shadow-elegant transition-smooth hover:shadow-glow">
              <Link to="/assess">
                Start Assessment <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/dashboard">View sample dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-smooth group-hover:bg-gradient-primary group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-gradient-primary p-10 text-center text-primary-foreground shadow-elegant">
        <h2 className="text-2xl font-semibold sm:text-3xl">Ready to find your real skill level?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80">
          Paste a job description and your resume — we'll handle the rest in under 5 minutes.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-6">
          <Link to="/assess">Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </section>
    </div>
  );
};

export default Index;
