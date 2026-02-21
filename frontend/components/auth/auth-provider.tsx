"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { setTokenGetter } from "@/lib/api";

/**
 * Syncs Clerk auth to the API client.
 * Registers a token getter so every API request gets a fresh JWT,
 * eliminating stale-token 401 errors.
 */
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // Register the getter — Clerk's getToken() handles caching & refresh internally
      setTokenGetter(() => getToken());
    } else {
      setTokenGetter(null);
    }
    setTokenReady(true);

    return () => setTokenGetter(null);
  }, [getToken, isSignedIn, isLoaded]);

  // Don't render children until auth is loaded and token getter is set
  if (!isLoaded || !tokenReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-skyblue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
