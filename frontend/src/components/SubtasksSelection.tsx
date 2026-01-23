import React, { useState, useEffect } from "react";
import { Task, priorityColors, statusColors, TaskStatus } from "../types/task";
import { getTasksNoParents } from "../api/taskApi";
import { X } from "lucide-react";

interface SubtaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: number[]) => void;
  initialTaskId?: number | null;
}

export const SubtaskSelection: React.FC<SubtaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTaskId,
}) => {
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const tasks = await getTasksNoParents();

        const filteredTasks = tasks.filter((t: Task) => {
          const isNotInitialTask = t.id !== initialTaskId;
          const hasNoSubtasks = !t.subtasks || t.subtasks.length === 0;
          const isNotDone = t.status !== TaskStatus.DONE;

          return isNotInitialTask && hasNoSubtasks && isNotDone;
        });

        setAvailableTasks(filteredTasks);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, initialTaskId]);

  const toggleTask = (taskId: number) => {
    setSelectedIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              Choose subtasks from list
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X />
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="my-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {availableTasks.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  No suitable tasks available.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableTasks.map((task) => (
                    <label
                      key={task.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:bg-blue-50 ${
                        selectedIds.includes(task.id)
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedIds.includes(task.id)}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span className="font-medium text-gray-700">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold uppercase ${
                            statusColors[task.status]
                          }`}
                        >
                          {task.status}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase ${
                            priorityColors[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit(selectedIds);
                onClose();
              }}
              disabled={selectedIds.length === 0}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
