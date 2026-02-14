"use client";

import { ChatInterface } from "@/components/chat/chat-interface";

export default function AssistantPage() {
  return (
    <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.8)-theme(spacing.8))] -m-4 md:-m-6 lg:-m-8">
      <ChatInterface />
    </div>
  );
}
