import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-8xl font-bold text-gradient-brand mb-4">
          404
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Página No Encontrada
        </h1>
        <p className="text-muted-foreground mb-8 font-mono text-sm">
          La página que buscas no existe en esta bóveda.
        </p>
        <Button variant="gradient" asChild>
          <Link href="/">Volver al Inicio</Link>
        </Button>
      </div>
    </div>
  );
}
