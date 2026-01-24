import React from "react";
import { Task, priorityColors, statusColors } from "../types/task";
import { Card, CardBody, Chip, Button, Divider } from "@heroui/react";
import { Info, Edit3, Trash2 } from "lucide-react";

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
    <Card
      className="border-none bg-background/60 dark:bg-default-100/50 shadow-md"
      isHoverable
    >
      <CardBody className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{task.title}</h3>
            <div className="flex gap-2">
              <Chip
                size="md"
                variant="flat"
                className={`${priorityColors[task.priority]} border-none`}
              >
                {task.priority}
              </Chip>
              <Chip
                size="md"
                variant="flat"
                className={`${statusColors[task.status]} border-none`}
              >
                {task.status.replace("_", " ")}
              </Chip>
            </div>
          </div>
        </div>

        <p className="text-default-500 mb-6 text-sm line-clamp-3">
          {task.description || "No description provided."}
        </p>

        <Divider className="my-4" />

        <div className="flex justify-between items-center">
          <span className="text-xs text-default-400 font-medium">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
          <div className="flex gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="warning"
              onPress={() => onTaskClick(task.id)}
            >
              <Info size={18} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="primary"
              onPress={() => onEdit(task)}
            >
              <Edit3 size={18} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => onDelete(task.id)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
