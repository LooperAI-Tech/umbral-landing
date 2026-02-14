"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Lightbulb,
  Target,
  CheckSquare,
  Rocket,
  BookOpen,
  Bot,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { COMMUNITY_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", shortcut: "d" },
  { icon: Lightbulb, label: "Projects", href: "/dashboard/projects", shortcut: "p" },
  { icon: BookOpen, label: "Learnings", href: "/dashboard/learnings", shortcut: "l" },
  { icon: Bot, label: "AI Assistant", href: "/dashboard/assistant", shortcut: "a", accent: true },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/dashboard/settings", shortcut: "s" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Logo size="md" />
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          {COMMUNITY_NAME}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigationItems.map((item, index) => {
          if (index === navigationItems.length - 1) {
            return (
              <div key={item.href}>
                <hr className="border-sidebar-border my-3" />
                <NavItem item={item} active={isActive(item.href)} />
              </div>
            );
          }
          return (
            <NavItem key={item.href} item={item} active={isActive(item.href)} />
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 space-y-1 border-t border-sidebar-border">
        {bottomItems.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} />
        ))}
        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <span className="text-sm text-muted-foreground font-mono truncate">
            Account
          </span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  item,
  active,
}: {
  item: (typeof navigationItems)[0];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
        active
          ? "bg-sidebar-accent text-brand-skyblue"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        item.accent && !active && "text-brand-skyblue/80"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-brand-skyblue" : "text-muted-foreground group-hover:text-sidebar-foreground",
          item.accent && "text-brand-skyblue"
        )}
      />
      <span className="truncate">{item.label}</span>
      {item.shortcut && (
        <kbd className="ml-auto text-[10px] font-mono text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded hidden lg:inline-block">
          {item.shortcut}
        </kbd>
      )}
    </Link>
  );
}
