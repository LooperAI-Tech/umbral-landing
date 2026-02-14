import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Your AI Learning Vault overview
        </p>
      </div>

      {/* Stats placeholder - will be built in Phase 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Projects", value: "--" },
          { label: "Milestones", value: "--" },
          { label: "Tasks", value: "--" },
          { label: "Learnings", value: "--" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-4 glow-hover transition-all"
          >
            <span className="font-mono text-xs text-brand-skyblue uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="text-3xl font-bold text-foreground font-mono mt-2">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Projects",
            description: "Track your AI/ML project ideas and progress",
            href: "/dashboard/projects",
          },
          {
            title: "Learnings",
            description: "Document concepts, patterns, and insights",
            href: "/dashboard/learnings",
          },
          {
            title: "AI Assistant",
            description: "Get help from your context-aware AI tutor",
            href: "/dashboard/assistant",
          },
        ].map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="bg-card border border-border rounded-lg p-6 glow-hover transition-all group"
          >
            <h3 className="text-lg font-semibold text-foreground group-hover:text-brand-skyblue transition-colors">
              {card.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              {card.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
