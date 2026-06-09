import { Router } from "express";
import {
  moveTaskHandler,
  addColumnHandler,
  getBottlenecksReport,
  getProductivityReport,
  getBoardHandler,
  getUserBoardsHandler,
  createBoardHandler,
  addMemberHandler,
} from "../controllers/boardController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.patch(
  "/boards/:boardId/tasks/:taskId/move",
  authenticateToken,
  moveTaskHandler,
);
router.get("/boards", authenticateToken, getUserBoardsHandler);
router.post("/boards", authenticateToken, createBoardHandler);
router.post("/boards/:boardId/columns", authenticateToken, addColumnHandler);
router.post("/boards/:boardId/members", authenticateToken, addMemberHandler);
router.get("/boards/:boardId", authenticateToken, getBoardHandler);
router.get(
  "/boards/:boardId/reports/bottlenecks",
  authenticateToken,
  getBottlenecksReport,
);
router.get(
  "/boards/:boardId/reports/productivity",
  authenticateToken,
  getProductivityReport,
);

export default router;
