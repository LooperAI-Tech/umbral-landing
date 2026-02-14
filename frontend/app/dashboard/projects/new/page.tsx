"use client";

import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          New Project
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Create a new AI/ML project to track
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
