import React, { useState, useEffect } from "react";
import { Task, priorityColors, statusColors, TaskStatus } from "../types/task";
import { getTasksNoParents } from "../api/taskApi";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Chip,
  Spinner,
} from "@heroui/react";

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
      setSelectedIds([]); // Reset selection when opening
    }
  }, [isOpen, initialTaskId]);

  const toggleTask = (taskId: number) => {
    setSelectedIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedIds);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Choose subtasks from list
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableTasks.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">
                      No suitable tasks available.
                    </p>
                  ) : (
                    availableTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:bg-default-100 ${selectedIds.includes(task.id)
                          ? "border-primary bg-primary-50"
                          : "border-default-200"
                          }`}
                        onClick={() => toggleTask(task.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            isSelected={selectedIds.includes(task.id)}
                            onValueChange={() => toggleTask(task.id)}
                          />
                          <span className="font-medium text-foreground">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            className={statusColors[task.status]}
                          >
                            {task.status.replace("_", " ")}
                          </Chip>
                          <Chip
                            size="sm"
                            variant="flat"
                            className={priorityColors[task.priority]}
                          >
                            {task.priority}
                          </Chip>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isDisabled={selectedIds.length === 0}
              >
                Submit ({selectedIds.length})
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
