import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";

interface BoardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
}

export const BoardFormModal: React.FC<BoardFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), description.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create New Board
            </ModalHeader>
            <ModalBody>
              <form id="board-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Title"
                  placeholder="Enter board title"
                  value={title}
                  onValueChange={setTitle}
                  isRequired
                  variant="bordered"
                />

                <Textarea
                  label="Description (Optional)"
                  placeholder="Enter board description"
                  value={description}
                  onValueChange={setDescription}
                  minRows={3}
                  variant="bordered"
                />
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" form="board-form" isDisabled={!title.trim()}>
                Create Board
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
