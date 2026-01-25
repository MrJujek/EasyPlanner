import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Task, UpdateTaskDto } from "../../types/task";
import {
  getMyDayTasks,
  getTask,
  updateTask,
  deleteTask,
  batchUpdateMyDay,
} from "../../api/taskApi";
import { TaskCard } from "../../components/TaskCard";
import { TaskForm } from "../../components/TaskForm";
import { useDebounce } from "../../hooks/useDebounce";
import { SearchBar } from "../../components/SearchBar";
import { FilterSelect } from "../../components/FilterSelect";
import { Spinner, Button } from "@heroui/react";
import { CalendarPlus, CalendarClock, CheckCircle } from "lucide-react";
import { MyDayTasksSelection } from "../../components/MyDayTasksSelection";

export const MyDay: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [addMode, setAddMode] = useState(true);
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
      const data = await getMyDayTasks();
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

  const handleBatchUpdateMyDay = async (data: [number, string | null][]) => {
    try {
      const formattedUpdates = data.map(([id, date]) => ({
        id: id,
        plannedFor: date,
      }));
      await batchUpdateMyDay(formattedUpdates);
      await fetchTasks();
    } catch (error) {
      console.error("Error during batch update", error);
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

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditFormOpen(true);
  };

  const openSelectionModal = (add: boolean) => {
    setAddMode(add);
    setIsSelectionOpen(true);
  };

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "DONE").length,
    [tasks],
  );

  const totalCount = tasks.length;

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Day</h2>
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
          </div>
        </div>
        {isLoading ? (
          <Spinner variant="simple" />
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-lg mb-4">
            There are no tasks planned for today
          </p>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">
              No tasks found matching your filters.
            </p>
            <Button
              onPress={() => {
                setSearch("");
                setStatus("");
                setPriority("");
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Clear filters
            </Button>
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

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 mt-4 border-t border-gray-100 w-full">
          <div className="flex items-center gap-4">
            <Button
              endContent={<CalendarPlus />}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
              onPress={() => openSelectionModal(true)}
            >
              Add to My Day
            </Button>
            <Button
              endContent={<CalendarClock />}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
              onPress={() => openSelectionModal(false)}
            >
              Reschedule/Remove tasks
            </Button>
          </div>
          {totalCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">
                Progress:{" "}
                <span className="text-gray-900 font-bold">
                  {completedCount}/{totalCount}
                </span>
              </span>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden ml-2 hidden sm:block">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <TaskForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleUpdate}
        initialData={editingTask}
      />
      <MyDayTasksSelection
        isOpen={isSelectionOpen}
        onClose={() => setIsSelectionOpen(false)}
        onSubmit={handleBatchUpdateMyDay}
        addMode={addMode}
      />
    </>
  );
};
