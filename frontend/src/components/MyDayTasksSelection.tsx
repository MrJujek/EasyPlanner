import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Task, priorityColors, statusColors, TaskStatus } from "../types/task";
import { getMyDayTasks, getTasks } from "../api/taskApi";
import {
  CalendarDays,
  Sun,
  X,
  CheckCircle2,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DatePicker, DateValue } from "@heroui/react";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";

interface MyDayFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: [number, string | null][]) => Promise<void>;
  addMode: boolean;
}

export const MyDayTasksSelection: React.FC<MyDayFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  addMode,
}) => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [scheduleTasks, setScheduleTasks] = useState<Task[]>([]);
  const [idsToDate, setIdsToDate] = useState<[number, string | null][]>([]);
  const [initialData, setInitialData] = useState<string>("[]");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<"today" | "schedule">(
    addMode ? "today" : "schedule",
  );

  const loadAllTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resToday, resSchedule] = await Promise.all([
        getTasks(),
        getMyDayTasks(),
      ]);

      const filterDone = (tasks: Task[]) =>
        tasks.filter((t) => t.status !== TaskStatus.DONE);

      const filteredToday = filterDone(resToday);
      const filteredSchedule = filterDone(resSchedule);

      setTodayTasks(filteredToday);
      setScheduleTasks(filteredSchedule);

      const combined = [...filteredToday, ...filteredSchedule];
      const prefilled: [number, string | null][] = combined
        .filter((t) => t.plannedFor)
        .map((t) => [t.id, t.plannedFor]);

      const sortedData = [...prefilled].sort((a, b) => a[0] - b[0]);
      setIdsToDate(sortedData);
      setInitialData(JSON.stringify(sortedData));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(addMode ? "today" : "schedule");
      loadAllTasks();
    }
  }, [isOpen, addMode, loadAllTasks]);

  const resetToInitial = useCallback(() => {
    setIdsToDate(JSON.parse(initialData));
  }, [initialData]);

  const hasChanges = useMemo(() => {
    const currentSorted = [...idsToDate].sort((a, b) => a[0] - b[0]);
    return JSON.stringify(currentSorted) !== initialData;
  }, [idsToDate, initialData]);

  const toggleTask = (toggledId: number) => {
    setIdsToDate((prev) => {
      const existingPair = prev.find(([id]) => id === toggledId);

      if (existingPair) {
        return existingPair[1] === null
          ? prev.filter(([id]) => id !== toggledId)
          : prev.map((pair) =>
              pair[0] === toggledId ? [toggledId, null] : pair,
            );
      } else {
        const dateStr = today(getLocalTimeZone()).toString();
        return [...prev, [toggledId, dateStr]];
      }
    });
  };

  const updateTaskDate = (toggledId: number, dateValue: DateValue | null) => {
    const dateStr = dateValue ? dateValue.toString() : null;

    setIdsToDate((prev) => {
      const exists = prev.some(([id]) => id === toggledId);
      if (exists) {
        return prev.map((pair) =>
          pair[0] === toggledId ? [toggledId, dateStr] : pair,
        );
      }
      return [...prev, [toggledId, dateStr]];
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onSubmit(idsToDate);
      onClose();
    } catch (error) {
      console.error("Failed to update tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentTasks = mode === "today" ? todayTasks : scheduleTasks;
  const selectedIds = idsToDate
    .filter(([, date]) => date !== null)
    .map(([id]) => id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-800">Manage your day</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex p-1 bg-gray-100 mx-6 mt-4 rounded-xl">
          <button
            onClick={() => {
              setMode("today");
              resetToInitial();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "today"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sun className="w-4 h-4" /> Add for today
          </button>
          <button
            onClick={() => {
              setMode("schedule");
              resetToInitial();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "schedule"
                ? "bg-white shadow-sm text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Plan for another date
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
            </div>
          ) : (
            <div className="space-y-3">
              {currentTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedIds.includes(task.id)
                      ? "border-blue-200 bg-blue-50/30"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 flex-shrink-0 flex justify-center">
                      {mode === "today" ? (
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedIds.includes(task.id)}
                          onChange={() => toggleTask(task.id)}
                        />
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <DatePicker
                            aria-label="Pick date"
                            variant="bordered"
                            minValue={today(getLocalTimeZone())}
                            popoverProps={{
                              className:
                                "bg-white shadow-xl rounded-xl border border-gray-200",
                              backdrop: "transparent",
                            }}
                            value={
                              idsToDate.find(([id]) => id === task.id)?.[1]
                                ? parseDate(
                                    idsToDate.find(
                                      ([id]) => id === task.id,
                                    )![1] as string,
                                  )
                                : null
                            }
                            onChange={(date) => updateTaskDate(task.id, date)}
                            className="w-10"
                            classNames={{
                              inputWrapper: "bg-white px-0 justify-center",
                              input: "hidden",
                            }}
                            showMonthAndYearPickers
                            selectorIcon={
                              <CalendarIcon
                                className={`w-5 h-5 ${selectedIds.includes(task.id) ? "text-purple-600" : "text-gray-400"}`}
                              />
                            }
                          />
                          {idsToDate.find(([id]) => id === task.id)?.[1] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTaskDate(task.id, null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 z-10 border border-white shadow-sm"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-700 truncate">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColors[task.status]}`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${priorityColors[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    {idsToDate.some(([id]) => id === task.id) &&
                      mode === "schedule" && (
                        <span
                          className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            idsToDate.find((item) => item[0] === task.id)?.[1]
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {idsToDate.find((item) => item[0] === task.id)?.[1] ||
                            "No date"}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
