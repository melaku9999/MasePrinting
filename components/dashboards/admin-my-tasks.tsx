import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye } from "lucide-react";
import { mockTasks } from "@/lib/auth";
import { TaskDetails } from "@/components/tasks/task-details";

const ADMIN_ID = "1"; // Assuming admin user id is "1"

export function AdminMyTasks() {
  const [viewMode, setViewMode] = useState<"list" | "view">("list");
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const myTasks = mockTasks.filter((task) => task.assignedTo === ADMIN_ID);

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setViewMode("view");
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setViewMode("list");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <Badge variant="outline">{myTasks.length} Total Tasks</Badge>
      </div>
      {viewMode === "view" && selectedTask ? (
        <TaskDetails
          task={selectedTask}
          onEdit={() => {}}
          onBack={handleBackToList}
          allowSubtaskCreation={true}
        />
      ) : (
        <div className="space-y-4">
          {myTasks.map((task) => (
            <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "default"
                          : task.status === "in-progress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{task.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="w-24 h-2" />
                    <span className="text-sm">{task.progress}%</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTask(task)}
                    className="flex items-center gap-1 bg-transparent"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
