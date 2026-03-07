import { useState } from "react";
import { SharedTaskInterface } from "@/components/tasks/shared-task-interface";
import type { User as AuthUser } from "@/lib/auth";

const ADMIN_USER: AuthUser = {
  id: "1",
  name: "Administrator",
  email: "admin@company.com",
  role: "admin"
};

export function AdminMyTasks() {
  return (
    <SharedTaskInterface 
      user={ADMIN_USER}
      viewMode="employee"
      title="My Tasks"
      subtitle="Personal task management and progress tracking"
    />
  );
}
