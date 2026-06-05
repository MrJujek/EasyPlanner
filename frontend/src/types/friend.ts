export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export interface Friend {
  id: number;
  username: string;
  email: string;
}

export interface Friendship {
  id: number;
  requesterId: number;
  recipientId: number;
  status: FriendshipStatus;
  requester?: Friend;
  recipient?: Friend;
  createdAt: string;
}
