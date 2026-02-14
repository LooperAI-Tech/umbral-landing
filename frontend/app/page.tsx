import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PRODUCT_NAME, PRODUCT_TAGLINE, COMPANY_NAME } from "@/lib/constants";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-display font-bold text-gradient-brand">
              {PRODUCT_NAME}
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-[image:var(--gradient-brand)] text-white px-4 py-2 rounded-lg hover:shadow-[var(--shadow-glow)] transition-all font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6">
            Build AI Projects.
            <br />
            <span className="text-gradient-brand">Track Everything.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-mono">
            {PRODUCT_TAGLINE} — Document your AI/ML journey through hands-on
            project building with context-aware AI assistance.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-[image:var(--gradient-brand)] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start Building Free
            </Link>
            <Link
              href="#features"
              className="border border-border text-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-accent transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32">
          <h2 className="text-3xl font-display font-bold text-center text-foreground mb-12">
            Your AI Learning Vault
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Project Tracker",
                desc: "Organize AI/ML projects with milestones, tasks, and deployment tracking.",
              },
              {
                title: "Learning Repository",
                desc: "Document what you learned, when to use it, and when not to. Built-in spaced repetition.",
              },
              {
                title: "AI Assistant",
                desc: "Context-aware AI that knows your projects, stack, and learning history.",
              },
              {
                title: "Deployment Log",
                desc: "Track versioned deployments with feedback, metrics, and improvement plans.",
              },
              {
                title: "Progress Dashboard",
                desc: "See your stats, streaks, and activity feed across all projects at a glance.",
              },
              {
                title: "Learning Extraction",
                desc: "AI analyzes your chat conversations and extracts structured learnings automatically.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-lg p-6 glow-hover transition-all"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Ready to Build?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the AI PlayGrounds community and start tracking your AI learning journey.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-[image:var(--gradient-brand)] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:shadow-[var(--shadow-glow)] transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground font-mono text-sm">
            <p>&copy; 2026 {COMPANY_NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
