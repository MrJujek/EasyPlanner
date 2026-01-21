import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendsList,
  getPendingRequests,
} from "../controllers/friendController";

const router = Router();

router.post("/friends/request", authenticateToken, sendFriendRequest);
router.post(
  "/friends/accept/:requestId",
  authenticateToken,
  acceptFriendRequest,
);

router.get("/friends/requests", authenticateToken, getPendingRequests);
router.get("/friends", authenticateToken, getFriendsList);

export default router;
