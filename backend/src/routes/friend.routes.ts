import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendsList,
  getPendingRequests,
  getSentRequests,
  cancelFriendRequest,
  removeFriend,
} from "../controllers/friendController";

const router = Router();

router.post("/friends/request", authenticateToken, sendFriendRequest);
router.post(
  "/friends/accept/:requestId",
  authenticateToken,
  acceptFriendRequest,
);

router.get("/friends/requests", authenticateToken, getPendingRequests);
router.get("/friends/requests/sent", authenticateToken, getSentRequests);
router.get("/friends", authenticateToken, getFriendsList);

router.delete("/friends/requests/:id", authenticateToken, cancelFriendRequest);
router.delete("/friends/:friendId", authenticateToken, removeFriend);

export default router;
