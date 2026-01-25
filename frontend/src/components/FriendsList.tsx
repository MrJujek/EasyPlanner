import { useEffect, useState } from "react";
import { Friend, Friendship } from "../types/friend";
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  sendFriendRequest,
  getSentRequests,
  cancelFriendRequest,
  removeFriend,
} from "../api/friends";
import { AxiosError } from "axios";
import {
  Tabs,
  Tab,
  User as UserAvatar,
  Button,
  Input,
  Chip
} from "@heroui/react";
import { UserPlus, UserMinus, X, Check, Mail } from "lucide-react";

export const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [inboxRequests, setInboxRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [friendsData, inboxData, sentData] = await Promise.all([
        getFriends(),
        getFriendRequests(),
        getSentRequests(),
      ]);
      setFriends(friendsData);
      setInboxRequests(inboxData);
      setSentRequests(sentData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddFriend = async () => {
    if (!newFriendUsername.trim()) return;
    try {
      await sendFriendRequest(newFriendUsername);
      setNewFriendUsername("");
      setError("");
      fetchData();
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || "Failed to send request");
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await acceptFriendRequest(requestId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectOrCancel = async (requestId: number) => {
    try {
      await cancelFriendRequest(requestId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  const handleUnfriend = async (friendId: number) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    try {
      await removeFriend(friendId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-white dark:bg-default-50 p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Friends Manager</h2>

      <div className="flex gap-2 mb-8 items-start">
        <div className="flex-1">
          <Input
            startContent={<Mail className="text-default-400" size={18} />}
            placeholder="Enter username to invite"
            value={newFriendUsername}
            onValueChange={setNewFriendUsername}
            errorMessage={error}
            isInvalid={!!error}
            onClear={() => setError("")}
            isDisabled={isLoading}
          />
        </div>
        <Button
          color="primary"
          onPress={handleAddFriend}
          startContent={<UserPlus size={18} />}
          isLoading={isLoading}
        >
          Invite
        </Button>
      </div>

      <Tabs aria-label="Friends options" color="primary" variant="underlined">
        <Tab key="friends" title={
          <div className="flex items-center gap-2">
            <span>My Friends</span>
            <Chip size="sm" variant="flat">{friends.length}</Chip>
          </div>
        }>
          <div className="mt-4 space-y-2">
            {friends.length === 0 ? (
              <p className="text-default-500 py-4">You have no friends yet.</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="flex justify-between items-center p-3 rounded-lg border border-default-200 hover:bg-default-50 transition-colors">
                  <UserAvatar
                    name={friend.username}
                    description={friend.email}
                    avatarProps={{ isBordered: true }}
                  />
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => handleUnfriend(friend.id)}
                    title="Unfriend"
                  >
                    <UserMinus size={20} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Tab>

        <Tab key="inbox" title={
          <div className="flex items-center gap-2">
            <span>Inbox</span>
            {inboxRequests.length > 0 && <Chip size="sm" color="danger" variant="flat">{inboxRequests.length}</Chip>}
          </div>
        }>
          <div className="mt-4 space-y-2">
            {inboxRequests.length === 0 ? (
              <p className="text-default-500 py-4">No pending requests.</p>
            ) : (
              inboxRequests.map((req) => (
                <div key={req.id} className="flex justify-between items-center p-3 rounded-lg border border-default-200 bg-default-50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Friend Request from</span>
                    <UserAvatar
                      name={req.requester?.username}
                      avatarProps={{ size: "sm" }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<Check size={16} />}
                      onPress={() => handleAccept(req.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      isIconOnly
                      onPress={() => handleRejectOrCancel(req.id)}
                      title="Reject"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Tab>

        <Tab key="sent" title={
          <div className="flex items-center gap-2">
            <span>Sent Requests</span>
            <Chip size="sm" variant="flat">{sentRequests.length}</Chip>
          </div>
        }>
          <div className="mt-4 space-y-2">
            {sentRequests.length === 0 ? (
              <p className="text-default-500 py-4">No sent requests.</p>
            ) : (
              sentRequests.map((req) => (
                <div key={req.id} className="flex justify-between items-center p-3 rounded-lg border border-default-200">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-default-500">Sent to</span>
                    <UserAvatar
                      name={req.recipient?.username || "User"}
                      description={req.recipient?.email}
                      avatarProps={{ size: "sm" }}
                    />
                  </div>
                  <Button
                    size="sm"
                    color="default"
                    variant="flat"
                    onPress={() => handleRejectOrCancel(req.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};
