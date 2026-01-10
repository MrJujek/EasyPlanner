import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Task,
  TaskStatus,
  priorityColors,
  statusColors,
} from "../../types/task";
import { getTask, setSubtasks } from "../../api/taskApi";
import { SubtaskSelection } from "../../components/SubtasksSelection";

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const taskId = id ? parseInt(id, 10) : null;
  const [task, setTask] = useState<Task | null>(location.state?.task || null);
  const [isLoading, setIsLoading] = useState<boolean>(!task);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  useEffect(() => {
    if (taskId && (!task || task.id !== taskId)) {
      setIsLoading(true);
      fetchTask(taskId);
    }
  }, [taskId, task]);

  const fetchTask = async (id: number) => {
    try {
      const data = await getTask(id);
      setTask(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsFormOpen(true);
  };

  const handleAddSubtasks = async (subtasksIds: number[]) => {
    if (taskId === null) {
      console.error("Can't add subtasks to non-existing task");
      return;
    }

    try {
      await setSubtasks(taskId, subtasksIds);
      await fetchTask(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );

  if (!task)
    return (
      <div className="p-10 text-center text-gray-500">Task not found.</div>
    );

  const subtasks = task.subtasks || [];
  console.log(subtasks, task.subtasks);
  const completedSubtasks = subtasks.filter(
    (s) => s.status === TaskStatus.DONE
  ).length;
  const progress =
    subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : task.status == TaskStatus.DONE
      ? 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium text-sm"
          >
            ← Back to Dashboard
          </button>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Edit
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-10 border border-gray-100">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {task.title}
                </h1>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {task.description || "No description provided."}
                </p>
              </div>

              <hr className="border-gray-50 mb-8" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Subtasks</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-600">
                      {progress}%
                    </span>
                    <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {subtasks.length > 0 ? (
                    subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group cursor-pointer"
                        onClick={() =>
                          navigate(`/task/${subtask.id}`, {
                            state: { task: subtask },
                          })
                        }
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            subtask.status === TaskStatus.DONE
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span
                          className={`flex-1 font-medium ${
                            subtask.status === TaskStatus.DONE
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {subtask.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            priorityColors[subtask.priority]
                          }`}
                        >
                          {subtask.priority}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No subtasks added to this task.
                    </p>
                  )}
                  <button
                    className="w-full py-3 mt-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all text-sm font-semibold"
                    onClick={openCreateModal}
                  >
                    + Add new subtask
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                About this task
              </h4>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                    Current Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[task.status]
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                    Priority Level
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                    Created On
                  </label>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(task.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {task.parentId && (
                  <div className="pt-4 border-t border-gray-50">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                      Parent Task
                    </label>
                    <button
                      onClick={() => navigate(`/task/${task.parentId}`)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      View Parent Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SubtaskSelection
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddSubtasks}
        initialTaskId={taskId}
      />
    </div>
  );
};
