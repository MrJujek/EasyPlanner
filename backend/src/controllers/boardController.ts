import { type Response } from "express";
import { AppDataSource } from "../config/data-source";
import { TaskActivityLog } from "../model/kanban/TaskActivityLog";
import type { AuthRequest } from "../middleware/authMiddleware";
import { Board } from "../model/kanban/Board";
import { KanbanColumn } from "../model/kanban/KanbanColumn";
import { BoardMember, BoardRole } from "../model/kanban/BoardMember";
import { Task } from "../model/Task";
import { User } from "../model/User";
import { Friendship, FriendshipStatus } from "../model/Friendship";

const ensureBoardMembership = async (
  boardId: number,
  userId: number,
): Promise<boolean> => {
  const board = await AppDataSource.getRepository(Board).findOne({
    where: { id: boardId },
  });
  if (board && board.ownerId === userId) {
    return true;
  }

  const membership = await AppDataSource.getRepository(BoardMember).findOne({
    where: { boardId, userId },
  });
  return !!membership;
};

export const getUserBoardsHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const boards = await AppDataSource.getRepository(Board).find({
      where: [{ ownerId: userId }, { members: { userId: userId } }],
      relations: ["owner", "members", "members.user"],
    });
    res.status(200).json(boards);
  } catch (error) {
    console.error("Error fetching user boards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBoardHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { title, description } = req.body;
  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  try {
    await AppDataSource.transaction(async (manager) => {
      const board = new Board();
      board.title = title;
      board.description = description || null;
      board.ownerId = userId;

      const savedBoard = await manager.save(board);

      const col1 = new KanbanColumn();
      col1.title = "To Do";
      col1.order = 0;
      col1.boardId = savedBoard.id;
      col1.wipLimit = 5;

      const col2 = new KanbanColumn();
      col2.title = "In Progress";
      col2.order = 1;
      col2.boardId = savedBoard.id;
      col2.wipLimit = 5;

      const col3 = new KanbanColumn();
      col3.title = "Done";
      col3.order = 2;
      col3.boardId = savedBoard.id;
      col3.wipLimit = 5;

      await manager.save([col1, col2, col3]);

      res.status(201).json(savedBoard);
    });
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBoardHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { boardId: paramBoardId } = req.params;
  const boardId = paramBoardId ? Number(paramBoardId) : null;

  if (boardId === null || isNaN(boardId)) {
    res.status(400).json({ message: "Invalid boardId provided." });
    return;
  }

  try {
    const isMember = await ensureBoardMembership(boardId, userId);
    if (!isMember) {
      res.status(403).json({ message: "Forbidden: not a board member" });
      return;
    }

    const board = await AppDataSource.getRepository(Board).findOne({
      where: { id: boardId },
      relations: [
        "owner",
        "columns",
        "columns.tasks",
        "columns.tasks.user",
        "columns.tasks.sharedWith",
        "columns.tasks.subtasks",
        "members",
        "members.user",
      ],
      order: {
        columns: {
          order: "ASC",
        },
      },
    });

    if (!board) {
      res.status(404).json({ message: "Board not found" });
      return;
    }

    res.status(200).json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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
      where: { id: taskId },
    });
    if (!taskExists) {
      res.status(404).json({ message: "No given task found." });
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
        where: { id: taskId },
        lock: { mode: "pessimistic_write" },
      });
      if (!task) {
        throw { status: 404, message: "No given task found." };
      }

      const board = await transactionalEntityManager.findOne(Board, {
        where: { id: boardId },
      });

      const isBoardMember = await transactionalEntityManager.findOne(
        BoardMember,
        {
          where: { boardId: boardId, userId: userId },
        },
      );

      if (
        task.userId !== userId &&
        task.sharedWithId !== userId &&
        board?.ownerId !== userId &&
        !isBoardMember
      ) {
        throw { status: 403, message: "Forbidden to modify this task." };
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

      if (task.columnId !== targetColumnId || task.boardId !== boardId) {
        const log = new TaskActivityLog();
        log.taskId = task.id;
        log.userId = userId as number;
        log.boardId = boardId;
        log.fromColumnId = task.columnId;
        log.toColumnId = targetColumnId;
        await transactionalEntityManager.save(log);
      }

      task.boardId = boardId;
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
    res.status(403).json({ message: "Forbidden: not a board member" });
    return;
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

      // re-check columns count under lock and enforce MAX_COLUMNS
      const currentColumnsCountAfterLock =
        await transactionalEntityManager.count(KanbanColumn, {
          where: { boardId: boardId },
        });
      if (currentColumnsCountAfterLock >= Board.MAX_COLUMNS) {
        throw {
          status: 409,
          message: `Maximum number of columns (${Board.MAX_COLUMNS}) reached for this board.`,
        };
      }

      // ensure targetOrder is still valid after re-count
      if (targetOrder > currentColumnsCountAfterLock) {
        targetOrder = currentColumnsCountAfterLock;
      }

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
      newColumn.wipLimit = newColumn.wipLimit =
        wipLimit === undefined || wipLimit === null ? 5 : Number(wipLimit);

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

export const addMemberHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { boardId: paramBoardId } = req.params;
  const boardId = Number(paramBoardId);
  const { username } = req.body;

  if (isNaN(boardId) || !username) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  try {
    const board = await AppDataSource.getRepository(Board).findOne({
      where: { id: boardId },
    });

    if (!board) {
      res.status(404).json({ message: "Board not found" });
      return;
    }

    if (board.ownerId !== userId) {
      res.status(403).json({ message: "Only the board owner can add members" });
      return;
    }

    const userToAdd = await AppDataSource.getRepository(User).findOne({
      where: { username },
    });

    if (!userToAdd) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (userToAdd.id === userId) {
      res
        .status(400)
        .json({ message: "Cannot add yourself to your own board" });
      return;
    }

    // Check if they are friends
    const friendship = await AppDataSource.getRepository(Friendship).findOne({
      where: [
        {
          requesterId: userId,
          recipientId: userToAdd.id,
          status: FriendshipStatus.ACCEPTED,
        },
        {
          requesterId: userToAdd.id,
          recipientId: userId,
          status: FriendshipStatus.ACCEPTED,
        },
      ],
    });

    if (!friendship) {
      res
        .status(403)
        .json({ message: "You can only share boards with friends" });
      return;
    }

    // Check if already a member
    const existingMember = await AppDataSource.getRepository(
      BoardMember,
    ).findOne({
      where: { boardId, userId: userToAdd.id },
    });

    if (existingMember) {
      res.status(400).json({ message: "User is already a member" });
      return;
    }

    const newMember = new BoardMember();
    newMember.boardId = boardId;
    newMember.userId = userToAdd.id;
    newMember.role = BoardRole.MEMBER;

    await AppDataSource.getRepository(BoardMember).save(newMember);

    res
      .status(201)
      .json({ message: "User added successfully", member: newMember });
  } catch (error) {
    console.error("Error adding board member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
