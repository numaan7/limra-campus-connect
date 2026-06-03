import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, LogIn, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, isTrainer } = useAuth();

  const authedDashboard = user && (isAdmin || isTrainer);

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/courses", label: "Courses", icon: BookOpen },
    authedDashboard
      ? { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
      : { to: "/login", label: "Login", icon: LogIn },
  ] as const;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      <ul className="grid grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center h-9 w-9 rounded-full transition-all ${
                    active ? "bg-primary/15 shadow-[0_0_18px_hsl(var(--primary)/0.45)]" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}