"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthToken } from "@/lib/api";

/**
 * Syncs Clerk auth token to the API client.
 * Blocks rendering children until the token is set so no API call fires without auth.
 */
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const syncToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
      setTokenReady(true);
    };
    syncToken();

    // Refresh token periodically (every 50 seconds, tokens last ~60s)
    const interval = setInterval(async () => {
      if (isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
      }
    }, 50000);
    return () => clearInterval(interval);
  }, [getToken, isSignedIn, isLoaded]);

  // Don't render children until auth is loaded and token is set
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
