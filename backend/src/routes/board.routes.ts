import { Router } from "express";
import { moveTaskHandler, addColumnHandler } from "../controllers/boardController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.patch("/boards/:boardId/tasks/:taskId/move", authenticateToken, moveTaskHandler);
router.post("/boards/:boardId/columns", authenticateToken, addColumnHandler);

export default router;