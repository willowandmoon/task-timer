"use client";

import { MessageCircle } from "lucide-react";
import type { ServerComment } from "@/services/comments";

interface CommentListProps {
  comments: ServerComment[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-3xl bg-white dark:bg-[#18104a] border border-gray-100 dark:border-[#2d1f7a] shadow-sm flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-6 h-6 text-violet-300" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
          No hay comentarios aún. ¡Sé el primero en comentar!
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="card-enter rounded-2xl bg-white dark:bg-[#18104a] border border-violet-100 dark:border-[#2d1f7a] p-4 shadow-sm"
        >
          <p className="text-sm text-gray-800 dark:text-indigo-100 break-words mb-2">
            {comment.content}
          </p>
          <p className="text-xs text-violet-400 dark:text-indigo-400">
            {formatDate(comment.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
