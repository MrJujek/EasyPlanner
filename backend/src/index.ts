import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { register, login, refresh } from "./controllers/authController";
import { AppDataSource } from "./config/data-source";
import { authenticateToken } from "./middleware/authMiddleware";
import {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
  updateTaskParent,
  toggleSubtasks,
  deleteTask,
  getTasksNoParents,
} from "./controllers/taskController";
import type { Request, Response, NextFunction } from "express";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT;

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.post("/register", register);
app.post("/login", login);
app.post("/refresh", refresh);

app.post("/tasks", authenticateToken, createTask);
app.get("/tasks", authenticateToken, getTasks);
app.get("/tasks/:id", authenticateToken, getSingleTask);
app.put("/tasks/:id", authenticateToken, updateTask);
app.patch("/tasks/:id/parent", authenticateToken, updateTaskParent);
app.patch("/tasks/:id/subtasks", authenticateToken, toggleSubtasks);
app.delete("/tasks/:id", authenticateToken, deleteTask);

app.get("/subtasks", authenticateToken, getTasksNoParents);
app.put("/subtasks/:id", authenticateToken, toggleSubtasks);

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`EasyPlanner running on port ${PORT}`));
  })
  .catch((err) => console.log("Database connection error: ", err));
