"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1e1260] border border-violet-100 dark:border-[#3525a0] shadow-sm flex items-center justify-center text-amber-400 dark:text-violet-300 hover:border-violet-300 dark:hover:border-violet-400 transition-all cursor-pointer"
    >
      {theme === "light" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
