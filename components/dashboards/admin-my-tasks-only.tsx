import { SharedTaskInterface } from "@/components/tasks/shared-task-interface";
import type { User as AuthUser } from "@/lib/auth";

interface AdminMyTasksOnlyProps {
  user: AuthUser;
}

export function MimiMyTasks({ user }: AdminMyTasksOnlyProps) {
  return (
    <SharedTaskInterface 
      user={user}
      viewMode="employee"
      title="My Tasks"
      subtitle="Personal task management and progress tracking"
    />
  );
}