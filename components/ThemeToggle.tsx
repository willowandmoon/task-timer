"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      className="w-10 h-10 rounded-2xl bg-white dark:bg-[#2a2450] border border-gray-100 dark:border-[#3a3460] shadow-sm flex items-center justify-center text-amber-400 dark:text-violet-300 hover:border-violet-200 dark:hover:border-violet-500 transition-all cursor-pointer"
    >
      {theme === "light" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
