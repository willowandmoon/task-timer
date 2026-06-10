import type { Task } from "@/types/task";

export type ServerTask = {
  id: string;
  title: string;
  status: Task["status"];
  startedAt?: string | null;
  doneAt?: string | null;
  inProgressDuration?: number | null;
  commentCount?: number;
};

export async function fetchTasks(): Promise<ServerTask[]> {
  const res = await fetch("/api/tasks");
  return res.json();
}

export async function fetchTaskById(id: string): Promise<ServerTask | null> {
  const res = await fetch(`/api/todolist/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createTask(title: string): Promise<ServerTask> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function updateTaskStatus(
  id: string,
  status: Task["status"]
): Promise<ServerTask> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
}
