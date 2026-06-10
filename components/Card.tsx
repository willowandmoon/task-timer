"use client";

import { useRouter } from "next/navigation";
import { Play, CheckCircle2, X, Clock, Zap, Eye, MessageCircle } from "lucide-react";
import type { TaskStatus } from "@/types/task";
import { formatTime } from "@/utils/format";

interface CardProps {
  id: string;
  title: string;
  status: TaskStatus;
  time: number;
  commentCount?: number;
  onStart: () => void;
  onFinish: () => void;
  onDelete: () => void;
}

export default function Card({
  id,
  title,
  status,
  time,
  commentCount = 0,
  onStart,
  onFinish,
  onDelete,
}: CardProps) {
  const router = useRouter();
  const goToDetail = () => router.push(`/todolist/${id}`);

  /* ── EN PROGRESO ─────────────────────────────────────────────────────────
     Light: violeta profundo  |  Dark: índigo eléctrico brillante           */
  if (status === "inprogress") {
    return (
      <div className="card-enter rounded-3xl bg-[#2d1869] dark:bg-[#3b1fa8] p-6 shadow-2xl shadow-violet-900/40 dark:shadow-indigo-900/60">
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 bg-white/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
              En Progreso
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 bg-white/10 px-2.5 py-1.5 rounded-full">
              <MessageCircle className="w-3 h-3" />
              {commentCount}
            </span>
          </div>
          <span
            className="text-3xl font-bold tabular-nums text-white"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {formatTime(time)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onFinish}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-150 cursor-pointer border border-white/10"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalizar
          </button>
          <button
            onClick={goToDetail}
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/15 active:scale-[0.98] text-white/80 text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-150 cursor-pointer border border-white/10"
          >
            <Eye className="w-4 h-4" />
            Ver detalles
          </button>
        </div>
      </div>
    );
  }

  /* ── COMPLETADA ──────────────────────────────────────────────────────────
     Light: verde pastel claro  |  Dark: verde bosque profundo               */
  if (status === "done") {
    return (
      <div className="card-enter rounded-3xl bg-emerald-50 dark:bg-[#0a2e1a] border border-emerald-200 dark:border-emerald-600/50 p-6 shadow-sm dark:shadow-emerald-900/30">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 dark:text-emerald-900 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-gray-800 dark:text-emerald-100 font-bold text-lg leading-snug break-words mb-4">
          {title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/50 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Completada
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/50 px-2.5 py-1.5 rounded-full">
              <MessageCircle className="w-3 h-3" />
              {commentCount}
            </span>
          </div>
          <span
            className="text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {formatTime(time)}
          </span>
        </div>

        <button
          onClick={goToDetail}
          className="w-full flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800/40 dark:hover:bg-emerald-800/60 active:scale-[0.98] text-emerald-700 dark:text-emerald-300 text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-150 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          Ver detalles
        </button>
      </div>
    );
  }

  /* ── PENDIENTE ───────────────────────────────────────────────────────────
     Light: blanco limpio con tinte violeta  |  Dark: azul noche neutro      */
  return (
    <div className="card-enter rounded-3xl bg-violet-50 dark:bg-[#0e0d2e] border border-violet-100 dark:border-[#1e1c5a] p-6 shadow-sm hover:shadow-md dark:hover:shadow-indigo-900/20 transition-shadow duration-200">
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <Clock className="w-5 h-5 text-violet-500 dark:text-indigo-400" />
        </div>
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-violet-300 dark:text-indigo-900 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-gray-900 dark:text-indigo-100 font-bold text-lg leading-snug break-words mb-4">
        {title}
      </h3>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-500 dark:text-indigo-400 bg-violet-100 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-500 dark:text-indigo-400 bg-violet-100 dark:bg-indigo-900/40 px-2.5 py-1.5 rounded-full">
            <MessageCircle className="w-3 h-3" />
            {commentCount}
          </span>
        </div>
        <span
          className="text-3xl font-bold tabular-nums text-violet-200 dark:text-indigo-800"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {formatTime(time)}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onStart}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-150 cursor-pointer shadow-sm shadow-violet-200 dark:shadow-violet-900/40"
        >
          <Play className="w-4 h-4" />
          Iniciar
        </button>
        <button
          onClick={goToDetail}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-violet-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 active:scale-[0.98] text-violet-600 dark:text-indigo-300 text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-150 cursor-pointer border border-violet-200 dark:border-[#2d1f7a]"
        >
          <Eye className="w-4 h-4" />
          Ver detalles
        </button>
      </div>
    </div>
  );
}
