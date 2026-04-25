import { Link, Outlet, useLocation } from "react-router-dom";
import { Accessibility } from "lucide-react";
import { cn } from "@/lib/utils";

export const Layout = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            
            <Accessibility className="h-6 w-6 text-primary" />

            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">Catalyst AI</div>
              <div className="text-xs text-muted-foreground">Real skills. Real plans.</div>
            </div>
          </Link>

          <nav className="hidden gap-6 md:flex">
            {[
              { to: "/", label: "Home" },
              { to: "/assess", label: "Assess" },
              { to: "/chat", label: "Interview" },
              { to: "/dashboard", label: "Dashboard" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground",
                  pathname === l.to && "text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="container py-10 md:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-xs text-muted-foreground">
          Made with ❤️ by Yash Munshi
        </div>
      </footer>
    </div>
  );
};