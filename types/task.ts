export type TaskStatus = "pending" | "inprogress" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  time: number;
  accumulatedTime: number;
  startTimestamp: number | null;
  inProgressDuration: number | null;
  commentCount?: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  reason: "deleted" | "done";
  inProgressDuration: number | null;
  archivedAt: string;
  originalCreatedAt: string;
}
