import { useEffect, useState } from "react";
import { getCompletedTasks } from "../../api/taskApi";
import { Task, priorityColors, statusColors } from "../../types/task";

export const Archive = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const data = await getCompletedTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Archive
          </h1>
          <p className="text-gray-500 mt-2">History of completed tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 py-10">
              No completed tasks found.
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative overflow-hidden opacity-90"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]} grayscale`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-500 mb-6 text-sm line-clamp-3 italic">
                  {task.description || "No description provided."}
                </p>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    {task.completedAt && (
                      <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                        Done: {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-50 rounded-md">
                    READ ONLY
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
