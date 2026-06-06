import { Router } from "express";
import { moveTaskHandler } from "../controllers/boardController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.patch("/boards/:boardId/tasks/:taskId/move", authenticateToken, moveTaskHandler);

export default router;