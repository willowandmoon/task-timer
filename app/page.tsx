"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import Card from "@/components/Card";
import Header from "@/components/Header";
import TaskInput from "@/components/TaskInput";
import HistoryModal from "@/components/HistoryModal";
import { fetchTasks, createTask, updateTaskStatus, deleteTask } from "@/services/taskService";
import { fetchHistory } from "@/services/historyService";
import { toLocal, type LocalTask } from "@/utils/taskMapper";
import type { HistoryItem } from "@/types/task";

export default function Home() {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchTasks().then((data) => setTasks(data.map(toLocal)));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.status === "inprogress" && task.startTimestamp) {
            const elapsed = Math.floor((Date.now() - task.startTimestamp) / 1000);
            return { ...task, time: task.accumulatedTime + elapsed };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleCreate() {
    const title = input.trim();
    if (!title) return;
    const created = await createTask(title);
    setTasks((prev) => [toLocal(created), ...prev]);
    setInput("");
  }

  async function handleStart(id: string) {
    const updated = await updateTaskStatus(id, "inprogress");
    const startTimestamp = updated.startedAt
      ? new Date(updated.startedAt).getTime()
      : Date.now();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: "inprogress", startTimestamp, accumulatedTime: 0, doneAt: null, countdown: null }
          : task
      )
    );
  }

  async function handleFinish(id: string) {
    const updated = await updateTaskStatus(id, "done");
    const finalTime = updated.inProgressDuration ?? 0;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "done",
              time: finalTime,
              accumulatedTime: finalTime,
              startTimestamp: null,
              inProgressDuration: finalTime,
            }
          : task
      )
    );
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  async function openHistory() {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      setHistory(await fetchHistory());
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <Header tasks={tasks} onOpenHistory={openHistory} />

      <TaskInput value={input} onChange={setInput} onSubmit={handleCreate} />

      {tasks.length > 0 && (
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-1">
          Tareas activas
        </p>
      )}

      <section className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-[#18104a] border border-gray-100 dark:border-[#2d1f7a] shadow-sm flex items-center justify-center mx-auto mb-4">
              <Timer className="w-7 h-7 text-violet-300" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">
              No hay tareas aún
            </p>
            <p className="text-gray-300 dark:text-gray-600 text-xs">
              Escribe una tarea arriba para empezar.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <Card
              key={task.id}
              id={task.id}
              commentCount={task.commentCount ?? 0}
              title={task.title}
              status={task.status}
              time={task.time}
              onStart={() => handleStart(task.id)}
              onFinish={() => handleFinish(task.id)}
              onDelete={() => handleDelete(task.id)}
            />
          ))
        )}
      </section>

      {showHistory && (
        <HistoryModal
          history={history}
          loading={loadingHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </main>
  );
}
