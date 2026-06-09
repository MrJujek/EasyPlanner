import { type Response } from "express";
import { AppDataSource } from "../config/data-source";
import { TaskActivityLog } from "../model/kanban/TaskActivityLog";
import type { AuthRequest } from "../middleware/authMiddleware";
import { Board } from "../model/kanban/Board";
import { KanbanColumn } from "../model/kanban/KanbanColumn";
import { BoardMember } from "../model/kanban/BoardMember";
import { Task } from "../model/Task";
import type { EntityManager } from "typeorm";

// check if given user is a member of the board
const ensureBoardMembership = async (
  boardId: number,
  userId: number,
): Promise<boolean> => {
  const membership = await AppDataSource.getRepository(BoardMember).findOne({
    where: { boardId, userId },
  });
  return !!membership;
};

export const moveTaskHandler = async (req: AuthRequest, res: Response) => {
  let userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { boardId: paramBoardId, taskId: paramTaskId } = req.params;
  const boardId = paramBoardId ? Number(paramBoardId) : null;
  const taskId = paramTaskId ? Number(paramTaskId) : null;
  const targetColumnId = req.body.targetColumnId
    ? Number(req.body.targetColumnId)
    : null;

  if (targetColumnId === null || isNaN(targetColumnId)) {
    res
      .status(400)
      .json({ message: "No valid targetColumnId parameter was given" });
    return;
  }

  if (boardId === null || taskId === null || isNaN(boardId) || isNaN(taskId)) {
    res.status(400).json({ message: "Invalid boardId or taskId provided" });
    return;
  }

  try {
    const columnExists = await AppDataSource.getRepository(
      KanbanColumn,
    ).findOne({
      where: { id: targetColumnId, boardId: boardId },
    });
    if (!columnExists) {
      res
        .status(404)
        .json({ message: "Target column doesn't exist on the board" });
      return;
    }

    const taskExists = await AppDataSource.getRepository(Task).findOne({
      where: { id: taskId, boardId: boardId },
    });
    if (!taskExists) {
      res.status(404).json({ message: "No given task found on the board." });
      return;
    }

    const isMember = await ensureBoardMembership(boardId, userId as number);
    if (!isMember) {
      res.status(403).json({ message: "Forbidden: not a board member" });
      return;
    }

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // find target column with pessimistic write lock
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

      // find and update task's columnId relation
      const task = await transactionalEntityManager.findOne(Task, {
        where: { id: taskId, boardId: boardId },
        lock: { mode: "pessimistic_write" },
      });
      if (!task) {
        throw { status: 404, message: "No given task found on the board." };
      }

      // check WIP limit
      if (
        task.columnId !== targetColumnId &&
        column.wipLimit > 0 &&
        currentTaskCount + 1 > column.wipLimit
      ) {
        throw {
          status: 409,
          message: `WIP limit (${column.wipLimit}) for column "${column.title}" is full already.`,
        };
      }

      if (task.columnId !== targetColumnId) {
        const log = new TaskActivityLog();
        log.taskId = task.id;
        log.userId = userId as number;
        log.boardId = boardId;
        log.fromColumnId = task.columnId;
        log.toColumnId = targetColumnId;
        await transactionalEntityManager.save(log);
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

export const addColumnHandler = async (req: AuthRequest, res: Response) => {
  let userId = req.user?.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { boardId: paramBoardId } = req.params;
  const boardId = paramBoardId ? Number(paramBoardId) : null;

  const { title, order, wipLimit } = req.body;

  if (!title) {
    res.status(400).json({ message: "Column title is required." });
    return;
  }

  if (boardId === null || isNaN(boardId)) {
    res.status(400).json({ message: "Invalid boardId provided." });
    return;
  }

  // ensure user is member of the board
  const isMember = await ensureBoardMembership(boardId, userId as number);
  if (!isMember) {
    throw { status: 403, message: "Forbidden: not a board member" };
  }

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // check if board exists
      const board = await transactionalEntityManager.findOne(Board, {
        where: { id: boardId },
      });

      if (!board) {
        throw { status: 404, message: "Board not found." };
      }

      let targetOrder = Number(order);

      // get amount of columns on board
      const currentColumnsCount = await transactionalEntityManager.count(
        KanbanColumn,
        {
          where: { boardId: boardId },
        },
      );

      // if order was not given, is invalid or greater than columns amount,
      // new column is inserted on last position
      // change it, if frontend will always provide correct order
      if (
        order === undefined ||
        order === null ||
        isNaN(targetOrder) ||
        targetOrder > currentColumnsCount
      ) {
        targetOrder = currentColumnsCount;
      }

      if (targetOrder < 0) {
        targetOrder = 0;
      }

      // lock columns for this board to avoid concurrent reordering races
      await transactionalEntityManager
        .createQueryBuilder(KanbanColumn, "c")
        .setLock("pessimistic_write")
        .where("c.boardId = :boardId", { boardId })
        .getMany();

      // every order is incremented by one for all columns that match expression: order >= targetOrder
      await transactionalEntityManager
        .createQueryBuilder()
        .update(KanbanColumn)
        .set({ order: () => '"order" + 1' })
        .where("boardId = :boardId", { boardId })
        .andWhere('"order" >= :targetOrder', { targetOrder })
        .execute();

      // create and write new column
      const newColumn = new KanbanColumn();
      newColumn.title = title;
      newColumn.boardId = boardId;
      newColumn.order = targetOrder;
      newColumn.wipLimit = wipLimit ? Number(wipLimit) : 0; // by default, no WIP limit

      await transactionalEntityManager.save(newColumn);
    });

    res
      .status(201)
      .json({ message: "Column added and board reordered successfully." });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error("Transaction error during column creation:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
};

export const getBottlenecksReport = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { boardId: paramBoardId } = req.params;
  const boardId = Number(paramBoardId);
  if (isNaN(boardId)) {
    res.status(400).json({ message: "Invalid boardId" });
    return;
  }

  const { startDate, endDate } = req.query;

  try {
    // membership check
    const isMember = await ensureBoardMembership(boardId, userId);
    if (!isMember) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const query = AppDataSource.getRepository(TaskActivityLog)
      .createQueryBuilder("log")
      .innerJoinAndSelect("log.toColumn", "toColumn")
      .where("log.boardId = :boardId", { boardId })
      .orderBy("log.taskId", "ASC")
      .addOrderBy("log.timestamp", "ASC");

    if (startDate) {
      query.andWhere("log.timestamp >= :startDate", { startDate });
    }
    if (endDate) {
      query.andWhere("log.timestamp <= :endDate", { endDate });
    }

    const logs = await query.getMany();

    // Group logs by taskId to calculate time spent in columns
    const taskLogs = new Map<number, TaskActivityLog[]>();
    for (const log of logs) {
      if (!taskLogs.has(log.taskId)) {
        taskLogs.set(log.taskId, []);
      }
      taskLogs.get(log.taskId)!.push(log);
    }

    // Calculate time
    const columnTimes = new Map<
      number,
      { title: string; totalMs: number; count: number }
    >();

    for (const [, tLogs] of taskLogs) {
      for (let i = 0; i < tLogs.length - 1; i++) {
        const currentLog = tLogs[i];
        const nextLog = tLogs[i + 1];
        if (!currentLog || !nextLog) continue;

        const durationMs =
          nextLog.timestamp.getTime() - currentLog.timestamp.getTime();

        const colId = currentLog.toColumnId;
        if (!columnTimes.has(colId)) {
          columnTimes.set(colId, {
            title: currentLog.toColumn.title,
            totalMs: 0,
            count: 0,
          });
        }

        const stats = columnTimes.get(colId)!;
        stats.totalMs += durationMs;
        stats.count += 1;
      }
    }

    const bottlenecks = Array.from(columnTimes.values()).map((stat) => ({
      columnTitle: stat.title,
      averageTimeMs: stat.totalMs / stat.count,
    }));

    res.status(200).json(bottlenecks);
  } catch (error) {
    console.error("Error generating bottlenecks report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductivityReport = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { boardId: paramBoardId } = req.params;
  const boardId = Number(paramBoardId);
  if (isNaN(boardId)) {
    res.status(400).json({ message: "Invalid boardId" });
    return;
  }

  const { startDate, endDate } = req.query;

  try {
    // membership check
    const isMember = await ensureBoardMembership(boardId, userId);
    if (!isMember) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const doneColumns = await AppDataSource.getRepository(KanbanColumn).find({
      where: { boardId },
    });
    const doneColumnIds = doneColumns
      .filter((c) => c.title.toLowerCase() === "done")
      .map((c) => c.id);

    if (doneColumnIds.length === 0) {
      const members = await AppDataSource.getRepository(BoardMember)
        .createQueryBuilder("bm")
        .innerJoinAndSelect("bm.user", "user")
        .where("bm.boardId = :boardId", { boardId })
        .getMany();

      res.status(200).json(
        members.map((bm) => ({
          userId: bm.user.id,
          username: bm.user.username,
          completedTasks: 0,
        })),
      );
      return;
    }

    const query = AppDataSource.getRepository(BoardMember)
      .createQueryBuilder("bm")
      .innerJoin("bm.user", "user")
      .leftJoin(
        "TaskActivityLog",
        "log",
        "log.userId = user.id AND log.boardId = bm.boardId AND log.toColumnId IN (:...doneColumnIds)",
        { doneColumnIds },
      )
      .where("bm.boardId = :boardId", { boardId });

    if (startDate) {
      query.andWhere("log.timestamp >= :startDate", { startDate });
    }
    if (endDate) {
      query.andWhere("log.timestamp <= :endDate", { endDate });
    }

    query
      .select([
        'user.id as "userId"',
        'user.username as "username"',
        'COUNT(log.id) as "completedTasks"',
      ])
      .groupBy("user.id")
      .addGroupBy("user.username")
      .orderBy('"completedTasks"', "DESC");

    const results = await query.getRawMany();

    const formattedResults = results.map((row) => ({
      userId: row.userId,
      username: row.username,
      completedTasks: Number(row.completedTasks),
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error generating productivity report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
