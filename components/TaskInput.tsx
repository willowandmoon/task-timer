"use client";

import { Plus, Zap } from "lucide-react";

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function TaskInput({ value, onChange, onSubmit }: TaskInputProps) {
  return (
    <section className="bg-white dark:bg-[#18104a] rounded-3xl border border-gray-100 dark:border-[#2d1f7a] shadow-sm p-3 mb-6 flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
        <Zap className="w-4 h-4 text-violet-400" />
      </div>
      <input
        type="text"
        placeholder="Nueva tarea..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        className="flex-1 text-sm outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-800 dark:text-gray-100 bg-transparent"
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:bg-violet-200 dark:disabled:bg-violet-900/40 text-white transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
    </section>
  );
}
