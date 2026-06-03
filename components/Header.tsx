"use client";

import { History, Timer, Clock, CheckCircle2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { LocalTask } from "@/utils/taskMapper";

interface HeaderProps {
  tasks: LocalTask[];
  onOpenHistory: () => void;
}

export default function Header({ tasks, onOpenHistory }: HeaderProps) {
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "inprogress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-300/40">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
              Task Timer
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              Gestiona tus tareas y mide tu tiempo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onOpenHistory}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1e1260] border border-gray-100 dark:border-[#3525a0] shadow-sm flex items-center justify-center text-gray-400 dark:text-violet-300 hover:text-violet-600 dark:hover:text-violet-200 hover:border-violet-200 dark:hover:border-violet-400 transition-all cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {pending > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              {pending} pendiente{pending !== 1 ? "s" : ""}
            </span>
          )}
          {inProgress > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400 pulse-dot" />
              {inProgress} en progreso
            </span>
          )}
          {done > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              {done} completada{done !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
