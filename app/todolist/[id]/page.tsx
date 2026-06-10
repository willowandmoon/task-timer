"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Zap, CheckCircle2, CalendarDays, MessageCircle, SearchX } from "lucide-react";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import { fetchTaskById, type ServerTask } from "@/services/taskService";
import { fetchComments, createComment, type ServerComment } from "@/services/comments";
import type { TaskStatus } from "@/types/task";

const STATUS_BADGE: Record<TaskStatus, { label: string; className: string; Icon: typeof Clock }> = {
  pending: {
    label: "Pendiente",
    className: "text-violet-500 dark:text-indigo-400 bg-violet-100 dark:bg-indigo-900/40",
    Icon: Clock,
  },
  inprogress: {
    label: "En Progreso",
    className: "text-violet-700 dark:text-violet-300 bg-violet-200 dark:bg-violet-900/50",
    Icon: Zap,
  },
  done: {
    label: "Completada",
    className: "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/50",
    Icon: CheckCircle2,
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<ServerTask | null>(null);
  const [comments, setComments] = useState<ServerComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchTaskById(id), fetchComments(id)])
      .then(([taskData, commentsData]) => {
        setTask(taskData);
        setComments(commentsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddComment(content: string) {
    const created = await createComment(id, content);
    setComments((prev) => [...prev, created]);
  }

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 py-10">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-20">
          Cargando...
        </p>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="max-w-md mx-auto px-4 py-10">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-sm text-violet-500 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-3xl bg-white dark:bg-[#18104a] border border-gray-100 dark:border-[#2d1f7a] shadow-sm flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-7 h-7 text-violet-300" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
            Tarea no encontrada.
          </p>
        </div>
      </main>
    );
  }

  const badge = STATUS_BADGE[task.status];

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-1.5 text-sm text-violet-500 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="card-enter rounded-3xl bg-violet-50 dark:bg-[#0e0d2e] border border-violet-100 dark:border-[#1e1c5a] p-6 shadow-sm mb-8">
        <h1 className="text-gray-900 dark:text-indigo-100 font-bold text-2xl leading-snug break-words mb-4">
          {task.title}
        </h1>

        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 ${badge.className}`}
        >
          <badge.Icon className="w-3 h-3" />
          {badge.label}
        </span>

        <div className="flex flex-col gap-2">
          {task.startedAt && (
            <p className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-indigo-300">
              <CalendarDays className="w-4 h-4 text-violet-400 dark:text-indigo-400" />
              <span className="font-semibold">Inicio:</span> {formatDate(task.startedAt)}
            </p>
          )}
          {task.doneAt && (
            <p className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-indigo-300">
              <CalendarDays className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="font-semibold">Fin:</span> {formatDate(task.doneAt)}
            </p>
          )}
        </div>
      </div>

      <section>
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 px-1">
          <MessageCircle className="w-4 h-4 text-violet-500 dark:text-indigo-400" />
          Comentarios ({comments.length})
        </h2>

        <CommentForm onSubmit={handleAddComment} />
        <CommentList comments={comments} />
      </section>
    </main>
  );
}
