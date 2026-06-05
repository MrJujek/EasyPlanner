import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Listbox,
  ListboxItem,
  User as UserAvatar,
  Input,
} from "@heroui/react";
import { getFriends } from "../api/friends";
import { shareTask } from "../api/taskApi";
import { Friend } from "../types/friend";
import { Task } from "../types/task";
import { Search } from "lucide-react";

interface ShareTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onShare: (updatedTask: Task) => void;
}

export const ShareTaskModal: React.FC<ShareTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onShare,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const data = await getFriends();
      setFriends(data);
    } catch (error) {
      console.error("Failed to load friends", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedFriendId) return;

    setIsSharing(true);
    try {
      const updatedTask = await shareTask(task.id, selectedFriendId);
      onShare(updatedTask);
      onClose();
    } catch (error) {
      console.error("Failed to share task", error);
    } finally {
      setIsSharing(false);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(search.toLowerCase()) ||
    friend.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Share "{task.title}"
            </ModalHeader>
            <ModalBody>
              <Input
                startContent={<Search size={18} className="text-default-400" />}
                placeholder="Search friends..."
                value={search}
                onValueChange={setSearch}
                variant="bordered"
                className="mb-2"
              />

              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center p-4 text-default-500">
                  {friends.length === 0 ? "You don't have any friends yet." : "No friends found matching your search."}
                </div>
              ) : (
                <Listbox
                  aria-label="Friends"
                  variant="flat"
                  disallowEmptySelection
                  selectionMode="single"
                  selectedKeys={selectedFriendId ? [selectedFriendId.toString()] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    if (selected) setSelectedFriendId(Number(selected));
                  }}
                  classNames={{
                    list: "max-h-[300px] overflow-y-auto",
                  }}
                >
                  {filteredFriends.map((friend) => (
                    <ListboxItem key={friend.id} textValue={friend.username}>
                      <div className="flex gap-2 items-center">
                        <UserAvatar
                          name={friend.username}
                          description={friend.email}
                          avatarProps={{
                            size: "sm",
                            isBordered: true,
                          }}
                        />
                      </div>
                    </ListboxItem>
                  ))}
                </Listbox>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleShare}
                isLoading={isSharing}
                isDisabled={!selectedFriendId}
              >
                Share
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
