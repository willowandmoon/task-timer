import type { HistoryItem } from "@/types/task";

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch("/api/history");
  return res.json();
}
