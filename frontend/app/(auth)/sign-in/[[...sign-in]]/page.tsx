import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-gradient-brand">
            Bienvenido a Umbral
          </h1>
          <p className="mt-2 text-muted-foreground font-mono text-sm">
            Inicia sesión para continuar tu camino de aprendizaje
          </p>
        </div>
        <SignIn
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl bg-card border border-border",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
