import type { Task } from "@/types/task";
import type { ServerTask } from "@/services/taskService";

export type LocalTask = Task & { doneAt: number | null; countdown: number | null };

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
      doneAt: null,
      countdown: null,
    };
  }
  if (t.status === "done" && t.doneAt) {
    const doneAt = new Date(t.doneAt).getTime();
    const remaining = Math.max(0, 10 - Math.floor((Date.now() - doneAt) / 1000));
    const time = t.inProgressDuration ?? 0;
    return {
      ...t,
      inProgressDuration: t.inProgressDuration ?? null,
      time,
      accumulatedTime: time,
      startTimestamp: null,
      doneAt,
      countdown: remaining,
    };
  }
  return {
    ...t,
    inProgressDuration: null,
    time: 0,
    accumulatedTime: 0,
    startTimestamp: null,
    doneAt: null,
    countdown: null,
  };
}
