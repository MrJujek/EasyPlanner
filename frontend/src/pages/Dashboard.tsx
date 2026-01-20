import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Task, CreateTaskDto, UpdateTaskDto } from "../types/task";
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from "../api/taskApi";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { useAuth } from "../contexts/AuthContextType";
import { useDebounce } from "../hooks/useDebounce";
import { SearchBar } from "../components/SearchBar";
import { FilterSelect } from "../components/FilterSelect";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      task.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = status ? task.status === status : true;
    const matchesPriority = priority ? task.priority === priority : true;

    return matchesPriority && matchesSearch && matchesStatus;
  });

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
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

  const handleCreate = async (data: CreateTaskDto) => {
    try {
      const newTask = await createTask(data);
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (data: UpdateTaskDto) => {
    if (!editingTask) return;
    try {
      const updated = await updateTask(editingTask.id, data);
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const openDetails = async (id: number) => {
    try {
      const task: Task = await getTask(id);
      navigate(`/task/${id}`, { state: { task } });
    } catch (error) {
      console.error(error);
    }
  };

  const openCreateModal = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            EasyPlanner
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">
              Hello, {user?.username || "User"}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-500 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Tasks</h2>
          <div className="flex gap-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search tasks..."
            />
            <FilterSelect
              value={priority}
              onChange={setPriority}
              defaultLabel="All Priorities"
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
              ]}
            />
            <FilterSelect
              value={status}
              onChange={setStatus}
              defaultLabel="All Statuses"
              options={[
                { label: "To Do", value: "TODO" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Done", value: "DONE" },
              ]}
            />
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold flex items-center gap-2"
            >
              <span>+</span> New Task
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">You have no tasks yet.</p>
            <button
              onClick={openCreateModal}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create your first task
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">
              No tasks found matching your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPriority("");
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTaskClick={openDetails}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        initialData={editingTask}
      />
    </div>
  );
};
