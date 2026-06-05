import { type Request, type Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../model/User";
import type { AuthRequest } from "../middleware/authMiddleware";
import { Friendship, FriendshipStatus } from "../model/Friendship";

const friendshipRepository = AppDataSource.getRepository(Friendship);
const userRepository = AppDataSource.getRepository(User);

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { username } = req.body;

  if (!userId) {
    return res.sendStatus(401);
  }

  try {
    const recipient = await userRepository.findOneBy({ username });
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    if (recipient.id === userId) {
      return res
        .status(400)
        .json({ error: "You cannot send a friend request to yourself" });
    }

    const existingFriendship = await friendshipRepository.findOne({
      where: [
        { requesterId: userId, recipientId: recipient.id },
        { requesterId: recipient.id, recipientId: userId },
      ],
    });

    if (existingFriendship) {
      return res.status(400).json({
        error: "Friend request already exists or you are already friends",
      });
    }

    const friendship = friendshipRepository.create({
      requesterId: userId,
      recipientId: recipient.id,
      status: FriendshipStatus.PENDING,
    });

    await friendshipRepository.save(friendship);

    res.status(201).json(friendship);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { requestId } = req.params;

  if (!userId) {
    return res.sendStatus(401);
  }

  if (!requestId) {
    return res.status(400).json({ error: "Request ID is required" });
  }

  try {
    const friendship = await friendshipRepository.findOne({
      where: { id: Number(requestId) },
      relations: ["recipient", "requester"],
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // ensure only the recipient can accept the friend request
    if (friendship.recipientId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // only pending requests can be accepted
    if (friendship.status !== FriendshipStatus.PENDING) {
      return res.status(400).json({ error: "Friend request is not pending" });
    }

    friendship.status = FriendshipStatus.ACCEPTED;
    await friendshipRepository.save(friendship);
    res.json(friendship);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getFriendsList = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.sendStatus(401);
  }
  try {
    const friendships = await friendshipRepository.find({
      where: [
        { requesterId: userId, status: FriendshipStatus.ACCEPTED },
        { recipientId: userId, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ["requester", "recipient"],
    });
    const friends = friendships.map((friendship) => {
      if (friendship.requesterId === userId) {
        return friendship.recipient;
      } else {
        return friendship.requester;
      }
    });

    const sanitizedFriends = friends.map(({ password_hash, ...user }) => user);

    res.json(sanitizedFriends);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getPendingRequests = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.sendStatus(401);
  }

  try {
    const pendingRequests = await friendshipRepository.find({
      where: { recipientId: userId, status: FriendshipStatus.PENDING },
      relations: ["requester"],
    });

    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getSentRequests = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.sendStatus(401);
  }

  try {
    const sentRequests = await friendshipRepository.find({
      where: { requesterId: userId, status: FriendshipStatus.PENDING },
      relations: ["recipient"],
    });

    res.json(sentRequests);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const cancelFriendRequest = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) return res.sendStatus(401);

  try {
    const friendship = await friendshipRepository.findOne({
      where: { id: Number(id) },
    });

    if (!friendship) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (
      friendship.requesterId !== userId &&
      friendship.recipientId !== userId
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await friendshipRepository.remove(friendship);
    res.json({ message: "Request cancelled/rejected" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { friendId } = req.params;

  if (!userId) return res.sendStatus(401);

  try {
    const friendIdNum = Number(friendId);

    const friendship = await friendshipRepository.findOne({
      where: [
        {
          requesterId: userId,
          recipientId: friendIdNum,
          status: FriendshipStatus.ACCEPTED,
        },
        {
          requesterId: friendIdNum,
          recipientId: userId,
          status: FriendshipStatus.ACCEPTED,
        },
      ],
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    await friendshipRepository.remove(friendship);
    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
