import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
  updateTaskParent,
  toggleSubtasks,
  deleteTask,
  getTasksNoParents,
  getCompletedTasks,
  getMyDay,
  addPlannedDate,
  removePlannedDate,
} from "../controllers/taskController";

const router = express.Router();

router.use(authenticateToken);

router.post("/tasks", authenticateToken, createTask);
router.get("/tasks", authenticateToken, getTasks);
router.get("/tasks/:id", authenticateToken, getSingleTask);
router.put("/tasks/:id", authenticateToken, updateTask);
router.patch("/tasks/:id/parent", authenticateToken, updateTaskParent);
router.patch("/tasks/:id/subtasks", authenticateToken, toggleSubtasks);
router.delete("/tasks/:id", authenticateToken, deleteTask);

router.get("/subtasks", authenticateToken, getTasksNoParents);
router.put("/subtasks/:id", authenticateToken, toggleSubtasks);

router.get("/history", authenticateToken, getCompletedTasks);

router.get("/my-day", authenticateToken, getMyDay);
router.patch("/planned", authenticateToken, addPlannedDate);
router.delete("/planned", authenticateToken, removePlannedDate);

export default router;
