import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@samacharhub/api-client-react";
import { setAdminToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        setAdminToken(data.token);
        queryClient.invalidateQueries();
        setLocation("/admin");
      },
      onError: () => {
        setError("Invalid email or password");
      },
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ data: { email, password } });
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-black text-primary">SamacharHUB</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin CMS</p>
        </div>

        <div className="bg-white rounded-sm border border-border shadow-sm p-6">
          <h2 className="font-serif text-xl font-bold mb-6">Sign In</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                SHaceholder="admin@samacharhub.com"
                className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                SHaceholder="••••••••"
                className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-password"
              />
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
              data-testid="button-login"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
