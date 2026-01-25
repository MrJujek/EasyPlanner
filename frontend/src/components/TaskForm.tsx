import React, { useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus, CreateTaskDto } from "../types/task";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDto) => void;
  initialData?: Task;
  parentId?: number;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentId,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setStatus(initialData.status);
      setPriority(initialData.priority);
    } else {
      setTitle("");
      setDescription("");
      setStatus(TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSubmit({ title, description, status, priority, parentId });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {initialData ? "Edit Task" : "New Task"}
            </ModalHeader>
            <ModalBody>
              <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Title"
                  placeholder="Enter task title"
                  value={title}
                  onValueChange={setTitle}
                  isRequired
                  variant="bordered"
                />

                <Textarea
                  label="Description"
                  placeholder="Enter task details"
                  value={description}
                  onValueChange={setDescription}
                  minRows={3}
                  variant="bordered"
                />

                <div className="flex gap-4">
                  <Select
                    label="Priority"
                    selectedKeys={[priority]}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full"
                    variant="bordered"
                  >
                    {Object.values(TaskPriority).map((p) => (
                      <SelectItem key={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Status"
                    selectedKeys={[status]}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full"
                    variant="bordered"
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <SelectItem key={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" form="task-form">
                {initialData ? "Save Changes" : "Create Task"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
