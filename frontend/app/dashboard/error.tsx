"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="font-mono text-6xl text-destructive mb-4">!</div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">
          Algo salió mal
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {error.message || "Ocurrió un error inesperado."}
        </p>
        <Button variant="gradient" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
