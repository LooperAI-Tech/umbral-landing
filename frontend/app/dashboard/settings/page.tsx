"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none border-0 w-full",
            },
          }}
        />
      </div>
    </div>
  );
}
