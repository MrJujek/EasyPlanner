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
  Chip,
} from "@heroui/react";
import { getFriends } from "../../api/friends";
import { Friend } from "../../types/friend";
import { Board } from "../../types/board";
import { Search } from "lucide-react";

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
  board: Board;
}

export const ShareBoardModal: React.FC<ShareBoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  board,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFriendUsername, setSelectedFriendUsername] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      setSearch("");
      setSelectedFriendUsername(null);
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

  const handleSubmit = () => {
    if (!selectedFriendUsername) return;
    onSubmit(selectedFriendUsername);
    onClose();
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(search.toLowerCase()) ||
    friend.email.toLowerCase().includes(search.toLowerCase())
  );

  const currentMembers = board.members || [];
  const memberUsernames = currentMembers.map(m => m.user?.username).filter(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Share Board "{board.title}"
            </ModalHeader>
            <ModalBody>
              {currentMembers.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-default-500 mb-2 font-medium">Currently shared with:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentMembers.map(member => member.user && (
                      <Chip key={member.userId} variant="flat" color="secondary">
                        {member.user.username}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

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
                  selectedKeys={selectedFriendUsername ? [selectedFriendUsername] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    if (selected) setSelectedFriendUsername(selected as string);
                  }}
                  disabledKeys={memberUsernames}
                  classNames={{
                    list: "max-h-[300px] overflow-y-auto",
                  }}
                >
                  {filteredFriends.map((friend) => (
                    <ListboxItem key={friend.username} textValue={friend.username}>
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
                onPress={handleSubmit}
                isDisabled={!selectedFriendUsername}
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
