import { useEffect, useState } from "react";
import { Friend, Friendship } from "../types/friend";
import { getFriendRequests, getFriends } from "../api/friends";

export const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friendship[]>([]);

  const fetchData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Friends</h2>

      {requests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Requests</h3>
          <ul className="space-y-2">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex justify-between items-center bg-gray-50 p-2 rounded"
              >
                <span>{req.requester?.username}</span>
                <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">
                  Accept
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">My Friends</h3>
      {friends.length === 0 ? (
        <p className="text-gray-500">No friends yet.</p>
      ) : (
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className="flex items-center gap-2 p-2 border-b"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                {friend.username.charAt(0).toUpperCase()}
              </div>
              <span>{friend.username}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
