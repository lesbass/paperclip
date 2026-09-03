import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "@/lib/router";
import { authApi } from "../api/auth";
import { queryKeys } from "../lib/queryKeys";
import { getRememberedInvitePath } from "../lib/invite-memory";
import { Button } from "@/components/ui/button";
import { AsciiArtAnimation } from "@/components/AsciiArtAnimation";
import { PaperclipLoading } from "@/components/AnimatedPaperclipIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PaperclipLockup } from "../components/PaperclipLockup";

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const nextPath = useMemo(() => searchParams.get("next") || getRememberedInvitePath() || "/", [searchParams]);
  const { data: session, isLoading: isSessionLoading } = useQuery({ queryKey: queryKeys.auth.session, queryFn: () => authApi.getSession(), retry: false });

  useEffect(() => { if (session) navigate(nextPath, { replace: true }); }, [session, navigate, nextPath]);

  const signIn = async () => {
    setIsRedirecting(true); setError(null);
    try {
      const response = await fetch("/api/auth/sign-in/social", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: "auth0", callbackURL: nextPath }) });
      const body = await response.json().catch(() => null) as { url?: unknown; message?: unknown } | null;
      if (!response.ok || typeof body?.url !== "string") throw new Error(typeof body?.message === "string" ? body.message : "Unable to start Auth0 sign-in.");
      window.location.assign(body.url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to start Auth0 sign-in."); setIsRedirecting(false); }
  };

  if (isSessionLoading) return <div className="fixed inset-0 flex items-center justify-center"><PaperclipLoading className="min-h-0" /></div>;
  return <div className="fixed inset-0 flex bg-background">
    <div className="absolute top-4 right-4 z-10"><ThemeToggle /></div>
    <div className="w-full md:w-1/2 flex flex-col overflow-y-auto"><div className="w-full max-w-md mx-auto my-auto px-8 py-12">
      <div className="mb-8"><PaperclipLockup className="h-5 w-auto" /></div>
      <h1 className="text-xl font-semibold">Sign in to Paperclip</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in with your Auth0 account to access this instance.</p>
      {error && <p role="alert" className="mt-4 text-xs text-destructive">{error}</p>}
      <Button type="button" className="mt-6 w-full" disabled={isRedirecting} onClick={() => void signIn()}>{isRedirecting ? "Redirecting…" : "Continue with Auth0"}</Button>
    </div></div>
    <div className="hidden md:block w-1/2 overflow-hidden"><AsciiArtAnimation /></div>
  </div>;
}
