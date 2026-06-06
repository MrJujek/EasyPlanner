import { type Response } from "express";
import { AppDataSource } from "../config/data-source";
import type { AuthRequest } from "../middleware/authMiddleware";
import { KanbanColumn } from "../model/kanban/KanbanColumn";
import { Task } from "../model/Task";

export const moveTaskHandler = async (req: AuthRequest, res: Response) => {
  let userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { boardId: paramBoardId, taskId: paramTaskId } = req.params;
  const boardId = paramBoardId ? Number(paramBoardId) : null;
  const taskId = paramTaskId ? Number(paramTaskId) : null;
  const { targetColumnId } = req.body;

  if (!targetColumnId) {
    res.status(400).json({ message: "No targetColumnId paramiter was given" });
    return;
  }

  if (boardId === null || taskId === null || isNaN(boardId) || isNaN(taskId)) {
    res.status(400).json({ message: "Invalid boardId or taskId provided" });
    return;
  }

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {

      // find target column with pessimistic blocade
      const column = await transactionalEntityManager.findOne(KanbanColumn, {
        where: { id: targetColumnId, boardId: boardId },
        lock: { mode: "pessimistic_write" },
      });

      if (!column) {
        throw {
          status: 404,
          message: "Target column doesn't exist on the board",
        };
      }

      // read actual number of tasks
      const currentTaskCount = await transactionalEntityManager.count(Task, {
        where: { columnId: targetColumnId },
      });

      // check WIP limit
      if (column.wipLimit > 0 && currentTaskCount + 1 > column.wipLimit) {
        throw {
          status: 409,
          message: `WIP limit (${column.wipLimit}) for column "${column.title}" is full already.`,
        };
      }

      // find and update task's columnId relation
      const task = await transactionalEntityManager.findOne(Task, {
        where: { id: taskId, boardId: boardId },
      });

      if (!task) {
        throw { status: 404, message: "No given task found on the board." };
      }

      task.columnId = targetColumnId;
      await transactionalEntityManager.save(task);
    });

    res.status(200).json();
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error("Transaction error during task relocation:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
};
