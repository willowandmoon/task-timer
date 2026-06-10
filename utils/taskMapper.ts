import type { Task } from "@/types/task";
import type { ServerTask } from "@/services/taskService";

export type LocalTask = Task;

export function toLocal(t: ServerTask): LocalTask {
  if (t.status === "inprogress" && t.startedAt) {
    const startTimestamp = new Date(t.startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    return {
      ...t,
      inProgressDuration: null,
      time: elapsed,
      accumulatedTime: 0,
      startTimestamp,
    };
  }
  if (t.status === "done") {
    const time = t.inProgressDuration ?? 0;
    return {
      ...t,
      inProgressDuration: t.inProgressDuration ?? null,
      time,
      accumulatedTime: time,
      startTimestamp: null,
    };
  }
  return {
    ...t,
    inProgressDuration: null,
    time: 0,
    accumulatedTime: 0,
    startTimestamp: null,
  };
}
