import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Task } from "../../types/task";
import { getTasks } from "../../api/taskApi";

interface SelectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (taskId: number) => void;
  currentBoardId: number;
}

export const SelectTaskModal: React.FC<SelectTaskModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentBoardId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSelectedTaskId(null);
      getTasks()
        .then((data) => {
          setTasks(data.filter((t) => t.boardId !== currentBoardId));
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, currentBoardId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Select Task to Add
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No available tasks to add.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3 border rounded-xl cursor-pointer transition-colors ${selectedTaskId === task.id
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-primary/50 dark:border-gray-700 dark:hover:border-primary/50"
                        }`}
                    >
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={selectedTaskId === null}
                onPress={() => {
                  if (selectedTaskId !== null) {
                    onSelect(selectedTaskId);
                    onClose();
                  }
                }}
              >
                Add Task
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
