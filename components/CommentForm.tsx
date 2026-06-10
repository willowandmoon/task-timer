"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await onSubmit(text);
      setContent("");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un comentario..."
        className="flex-1 rounded-2xl bg-white dark:bg-[#18104a] border border-violet-100 dark:border-[#2d1f7a] px-4 py-3 text-sm text-gray-800 dark:text-indigo-100 placeholder:text-gray-400 dark:placeholder:text-indigo-500 outline-none focus:border-violet-400 dark:focus:border-indigo-500 transition-colors"
      />
      <button
        type="submit"
        disabled={!content.trim() || sending}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 rounded-2xl transition-all duration-150 cursor-pointer shadow-sm shadow-violet-200 dark:shadow-violet-900/40"
      >
        <Send className="w-4 h-4" />
        Comentar
      </button>
    </form>
  );
}
