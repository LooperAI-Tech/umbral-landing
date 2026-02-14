import { cn } from "@/lib/utils";

interface TerminalHeaderProps {
  title: string;
  path?: string;
  status?: "online" | "offline" | "loading";
  actions?: React.ReactNode;
  className?: string;
}

export function TerminalHeader({
  title,
  path,
  status,
  actions,
  className,
}: TerminalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 bg-[var(--bg-terminal)] border-b border-[var(--border-subtle)] rounded-t-lg",
        className
      )}
    >
      {/* Traffic lights */}
      <div className="flex gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
        <span className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
      </div>

      {/* Title / Path */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-brand-skyblue">umbral</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-community-blue">{path || "~"}</span>
        <span className="text-muted-foreground">$</span>
        <span className="text-foreground">{title}</span>
      </div>

      {/* Status indicator */}
      {status && (
        <div className="flex items-center gap-1.5 ml-auto">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              status === "online" && "bg-status-completed animate-pulse",
              status === "loading" && "bg-status-progress animate-pulse",
              status === "offline" && "bg-status-blocked"
            )}
          />
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {status}
          </span>
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
