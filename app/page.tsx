"use client";

import { useState, useEffect, useRef } from "react";
import { Spinner } from "@heroui/react";
import { Plus, History, Timer, Clock, CheckCircle2, Zap, X } from "lucide-react";
import Card from "@/components/Card";
import type { Task, HistoryItem } from "@/types/task";

type ServerTask = {
  id: string;
  title: string;
  status: Task["status"];
  startedAt?: string | null;
  doneAt?: string | null;
  inProgressDuration?: number | null;
};

type LocalTask = Task & { doneAt: number | null; countdown: number | null };

function toLocal(t: ServerTask): LocalTask {
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

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Home() {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const doneTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: ServerTask[]) => setTasks(data.map(toLocal)));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.status === "inprogress" && task.startTimestamp) {
            const elapsed = Math.floor((Date.now() - task.startTimestamp) / 1000);
            return { ...task, time: task.accumulatedTime + elapsed };
          }
          if (task.status === "done" && task.doneAt !== null) {
            const remaining = Math.max(0, 10 - Math.floor((Date.now() - task.doneAt) / 1000));
            if (remaining !== task.countdown) return { ...task, countdown: remaining };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => doneTimers.current.forEach((t) => clearTimeout(t));
  }, []);

  async function handleCreate() {
    const title = input.trim();
    if (!title) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const created: ServerTask = await res.json();
    setTasks((prev) => [toLocal(created), ...prev]);
    setInput("");
  }

  async function handleStart(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "inprogress" }),
    });
    const updated: ServerTask = await res.json();
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
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    const updated: ServerTask = await res.json();
    const finalTime = updated.inProgressDuration ?? 0;
    const doneAt = Date.now();

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
              doneAt,
              countdown: 10,
            }
          : task
      )
    );

    const timer = setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      doneTimers.current.delete(id);
    }, 10_000);
    doneTimers.current.set(id, timer);
  }

  async function handleDelete(id: string) {
    const timer = doneTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      doneTimers.current.delete(id);
    }
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  async function openHistory() {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/history");
      setHistory(await res.json());
    } finally {
      setLoadingHistory(false);
    }
  }

  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "inprogress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <main className="max-w-md mx-auto px-4 py-10">

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-300/40">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
                Task Timer
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Gestiona tus tareas y mide tu tiempo
              </p>
            </div>
          </div>
          <button
            onClick={openHistory}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-200 transition-all cursor-pointer"
          >
            <History className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Stats pills */}
        {tasks.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {pending > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                <Clock className="w-3 h-3" />
                {pending} pendiente{pending !== 1 ? "s" : ""}
              </span>
            )}
            {inProgress > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 pulse-dot" />
                {inProgress} en progreso
              </span>
            )}
            {done > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                {done} completada{done !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Input bar */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 mb-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-violet-400" />
        </div>
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          className="flex-1 text-sm outline-none placeholder:text-gray-300 text-gray-800 bg-transparent"
        />
        <button
          onClick={handleCreate}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:bg-violet-200 text-white transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </section>

      {/* Section label */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-sm font-semibold text-gray-700">Tareas activas</p>
          <button
            onClick={openHistory}
            className="text-xs text-violet-500 font-medium hover:text-violet-700 transition-colors cursor-pointer"
          >
            Ver historial →
          </button>
        </div>
      )}

      {/* Task list */}
      <section className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-4">
              <Timer className="w-7 h-7 text-violet-300" />
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-1">No hay tareas aún</p>
            <p className="text-gray-300 text-xs">Escribe una tarea arriba para empezar.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <Card
              key={task.id}
              title={task.title}
              status={task.status}
              time={task.time}
              countdown={task.countdown}
              onStart={() => handleStart(task.id)}
              onFinish={() => handleFinish(task.id)}
              onDelete={() => handleDelete(task.id)}
            />
          ))
        )}
      </section>

      {/* History Modal */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowHistory(false)}
        >
          <div className="modal-enter bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                  <History className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-none">Historial</h2>
                  {history.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {history.length} registro{history.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-2.5">
              {loadingHistory ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Spinner size="md" color="accent" />
                  <p className="text-xs text-gray-400">Cargando historial...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                    <History className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-400">Sin registros aún</p>
                  <p className="text-xs text-gray-300 mt-1 text-center">
                    Las tareas eliminadas y completadas aparecerán aquí.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl px-4 py-3.5 ${
                      item.reason === "deleted"
                        ? "bg-rose-50 border border-rose-100"
                        : "bg-emerald-50 border border-emerald-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800 break-words leading-snug">
                        {item.title}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                          item.reason === "deleted"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.reason === "deleted" ? "Eliminada" : "Completada"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.inProgressDuration != null && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono font-semibold">
                            {formatDuration(item.inProgressDuration)}
                          </span>
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        {new Date(item.archivedAt).toLocaleString("es", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
