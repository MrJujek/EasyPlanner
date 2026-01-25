import React from "react";
import { Task, TaskStatus, priorityColors, statusColors } from "../types/task";
import { Card, CardBody, Chip, Button, Divider } from "@heroui/react";
import { Info, Edit3, Trash2, CheckCircle2, User as UserIcon, Share2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContextType";
import { ShareTaskModal } from "./ShareTaskModal";

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
  const { user } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const isDone = task.status === TaskStatus.DONE;
  const isOwner = user?.id === task.userId;

  const handleShareComplete = () => {
    window.location.reload();
  };

  return (
    <>
      <Card
        className={`border-none shadow-md transition-all duration-300 ${isDone
          ? "bg-green-50/50 dark:bg-green-900/10 ring-1 ring-green-500/30"
          : "bg-background/60 dark:bg-default-100/50"
          }`}
        isHoverable
      >
        {isDone && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-xl" />
        )}

        <CardBody className={`p-6 ${isDone ? "pl-7" : ""}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-full">
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-2 mb-2">
                  <h3
                    className={`text-xl font-bold ${isDone ? "text-green-700 dark:text-green-400" : ""}`}
                  >
                    {task.title}
                  </h3>
                  {isDone && <CheckCircle2 size={20} className="text-green-500" />}
                </div>

                {/* Shared Badges */}
                {isOwner && task.sharedWith && (
                  <Chip
                    startContent={<Share2 size={12} />}
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="mb-2"
                  >
                    Shared with {task.sharedWith.username}
                  </Chip>
                )}
                {!isOwner && (
                  <Chip
                    startContent={<UserIcon size={12} />}
                    size="sm"
                    variant="flat"
                    color="warning"
                    className="mb-2"
                  >
                    Shared by {task.user?.username || "Owner"}
                  </Chip>
                )}
              </div>

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
                  variant={isDone ? "shadow" : "flat"}
                  color={isDone ? "success" : "default"}
                  className={
                    isDone ? "" : `${statusColors[task.status]} border-none`
                  }
                >
                  {task.status.replace("_", " ")}
                </Chip>
              </div>
            </div>
          </div>

          <p
            className={`text-sm line-clamp-3 mb-6 ${isDone ? "text-green-800/70 dark:text-green-200/60" : "text-default-500"}`}
          >
            {task.description || "No description provided."}
          </p>

          <Divider className={`my-4 ${isDone ? "bg-green-500/20" : ""}`} />

          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-default-400 font-medium">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </span>
              <span
                className={`text-[10px] font-medium ${isDone ? "text-green-600/60" : "text-default-400"}`}
              >
                Planned:{" "}
                {task.plannedFor
                  ? new Date(task.plannedFor).toLocaleDateString()
                  : "No date"}
              </span>
              {isDone && (
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                  Completed: {new Date(task.completedAt!).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {isOwner && !task.sharedWith && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="secondary"
                  onPress={() => setIsShareModalOpen(true)}
                >
                  <Share2 size={18} />
                </Button>
              )}

              <Button
                isIconOnly
                size="sm"
                variant="light"
                color={isDone ? "success" : "warning"}
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
              {isOwner && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => onDelete(task.id)}
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <ShareTaskModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        task={task}
        onShare={handleShareComplete}
      />
    </>
  );
};
