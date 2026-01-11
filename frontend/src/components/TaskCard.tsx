import React from "react";
import { Task, priorityColors, statusColors } from "../types/task";

interface TaskCardProps {
  task: Task;
  onTaskClick: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">{task.title}</h3>
          <div className="flex gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                statusColors[task.status]
              }`}
            >
              {task.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-6 text-sm line-clamp-3">
        {task.description || "No description provided."}
      </p>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
        <span className="text-xs text-gray-400 font-medium">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onTaskClick(task.id)}
            className="px-3 py-1.5 text-sm font-medium text-yellow-600 hover:yellow-blue-800 hover:bg-yellow-50 rounded-lg transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
