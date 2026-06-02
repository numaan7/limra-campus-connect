import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center soft-card rounded-2xl p-8 max-w-sm">
          <h2 className="text-xl font-bold mb-2">Please Login</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
          <Link to="/login" className="inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
