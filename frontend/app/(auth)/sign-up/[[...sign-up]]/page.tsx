import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-gradient-brand">
            Únete a Umbral
          </h1>
          <p className="mt-2 text-muted-foreground font-mono text-sm">
            Crea tu cuenta y empieza a aprender con IA
          </p>
        </div>
        <SignUp
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl bg-card border border-border",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
