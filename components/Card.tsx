"use client";

import { Spinner } from "@heroui/react";
import { Play, CheckCircle2, X, Clock, Zap } from "lucide-react";
import type { TaskStatus } from "@/types/task";
import { formatTime } from "@/utils/format";

interface CardProps {
  title: string;
  status: TaskStatus;
  time: number;
  countdown: number | null;
  onStart: () => void;
  onFinish: () => void;
  onDelete: () => void;
}

export default function Card({
  title,
  status,
  time,
  countdown,
  onStart,
  onFinish,
  onDelete,
}: CardProps) {
  const progress = countdown !== null ? (countdown / 10) * 100 : 0;

  if (status === "inprogress") {
    return (
      <div className="card-enter rounded-3xl bg-[#1e1646] p-6 shadow-2xl shadow-violet-900/40">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-violet-300" />
          </div>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-white font-bold text-lg leading-snug break-words mb-4">
          {title}
        </h3>

        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
            En Progreso
          </span>
          <span
            className="text-3xl font-bold tabular-nums text-white"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {formatTime(time)}
          </span>
        </div>

        <button
          onClick={onFinish}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-150 cursor-pointer border border-white/10"
        >
          <CheckCircle2 className="w-4 h-4" />
          Finalizar
        </button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="card-enter rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg leading-snug break-words mb-4">
          {title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Completada
          </span>
          <span
            className="text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {formatTime(time)}
          </span>
        </div>

        {countdown !== null && (
          <div className="space-y-2">
            <div className="w-full h-1.5 bg-emerald-200/60 dark:bg-emerald-800/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 dark:bg-emerald-500 rounded-full"
                style={{ width: `${progress}%`, transition: "width 0.95s linear" }}
              />
            </div>
            <p className="text-xs text-emerald-600/60 dark:text-emerald-500/70 text-center">
              Se archiva en <span className="font-semibold">{countdown}s</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-enter rounded-3xl bg-white dark:bg-[#1a1535] border border-gray-100 dark:border-[#2a2450] p-6 shadow-sm hover:shadow-md dark:hover:shadow-violet-900/20 transition-shadow duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
          <Clock className="w-5 h-5 text-violet-500 dark:text-violet-400" />
        </div>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-snug break-words mb-4">
        {title}
      </h3>

      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full">
          <Clock className="w-3 h-3" />
          Pendiente
        </span>
        <span
          className="text-3xl font-bold tabular-nums text-slate-300 dark:text-slate-600"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {formatTime(time)}
        </span>
      </div>

      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-150 cursor-pointer shadow-sm shadow-violet-200 dark:shadow-violet-900/40"
      >
        <Play className="w-4 h-4" />
        Iniciar
      </button>
    </div>
  );
}
