import client from "./axiosInstance";
import { Friend, Friendship } from "../types/friend";

export const getFriends = async (): Promise<Friend[]> => {
  const response = await client.get("/friends");
  return response.data;
};

export const getFriendRequests = async (): Promise<Friendship[]> => {
  const response = await client.get("/friends/requests");
  return response.data;
};

export const sendFriendRequest = async (
  username: string,
): Promise<Friendship> => {
  const response = await client.post("/friends/request", { username });
  return response.data;
};

export const acceptFriendRequest = async (
  requestId: number,
): Promise<Friendship> => {
  const response = await client.post(`/friends/accept/${requestId}`);
  return response.data;
};

export const getSentRequests = async (): Promise<Friendship[]> => {
  const response = await client.get("/friends/requests/sent");
  return response.data;
};

export const cancelFriendRequest = async (requestId: number): Promise<void> => {
  await client.delete(`/friends/requests/${requestId}`);
};

export const removeFriend = async (friendId: number): Promise<void> => {
  await client.delete(`/friends/${friendId}`);
};
