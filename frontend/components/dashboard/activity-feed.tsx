"use client";

import type { ActivityFeedItem } from "@/types";

function formatAction(item: ActivityFeedItem): string {
  const entity = item.entity_type;
  const action = item.action;
  const name =
    (item.new_value as Record<string, string> | undefined)?.name ||
    (item.new_value as Record<string, string> | undefined)?.concept ||
    (item.new_value as Record<string, string> | undefined)?.title ||
    "";
  return `${action} ${entity}${name ? `: ${name}` : ""}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-mono">
        No recent activity
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 text-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-skyblue mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate">{formatAction(item)}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {timeAgo(item.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
