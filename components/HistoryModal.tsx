"use client";

import { X, History, Clock } from "lucide-react";
import { Spinner } from "@heroui/react";
import type { HistoryItem } from "@/types/task";
import { formatTime } from "@/utils/format";

interface HistoryModalProps {
  history: HistoryItem[];
  loading: boolean;
  onClose: () => void;
}

export default function HistoryModal({ history, loading, onClose }: HistoryModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-enter bg-white dark:bg-[#130c3d] rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#2d1f7a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
              <History className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                Historial
              </h2>
              {history.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {history.length} registro{history.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2450] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-2.5">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Spinner size="md" color="accent" />
              <p className="text-xs text-gray-400 dark:text-gray-500">Cargando historial...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#1e1260] border border-gray-100 dark:border-[#3525a0] flex items-center justify-center mb-3">
                <History className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">Sin registros aún</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 text-center">
                Las tareas eliminadas y completadas aparecerán aquí.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl px-4 py-3.5 ${
                  item.reason === "deleted"
                    ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800/40"
                    : "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words leading-snug">
                    {item.title}
                  </p>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                      item.reason === "deleted"
                        ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {item.reason === "deleted" ? "Eliminada" : "Completada"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {item.inProgressDuration != null && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono font-semibold">
                        {formatTime(item.inProgressDuration)}
                      </span>
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
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
  );
}
