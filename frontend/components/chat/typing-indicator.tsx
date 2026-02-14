"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-brand-skyblue animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-brand-skyblue animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-brand-skyblue animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-muted-foreground font-mono ml-1">
        La IA está pensando...
      </span>
    </div>
  );
}
