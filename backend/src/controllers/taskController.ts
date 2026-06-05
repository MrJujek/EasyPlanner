import { type Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task, TaskStatus } from "../model/Task";
import { type AuthRequest } from "../middleware/authMiddleware";
import { In, IsNull, type FindOptionsWhere } from "typeorm";
import { type User } from "../model/User";

const taskRepository = AppDataSource.getRepository(Task);

type SafeUser = Pick<User, "id" | "username" | "email">;

type SafeTask = Omit<Task, "user" | "sharedWith" | "subtasks"> & {
  user?: SafeUser | null;
  sharedWith?: SafeUser | null;
  subtasks?: SafeTask[];
};

const sanitizeUser = (user?: User | null): SafeUser | null => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
};

const sanitizeTask = (task: Task): SafeTask => ({
  ...task,
  user: sanitizeUser(task.user),
  sharedWith: sanitizeUser(task.sharedWith),
  subtasks: task.subtasks?.map((subtask) => sanitizeTask(subtask)),
});

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, parentId } = req.body;
    let userId = req.user?.userId;
    const parentTaskId = parentId ? Number(parentId) : null;
    let sharedWithId: number | null = null;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (parentTaskId) {
      const parentTask = await taskRepository.findOne({
        where: { id: parentTaskId },
      });

      if (!parentTask) {
        return res.status(404).json({ message: "Parent task not found" });
      }

      // validate that the parent task is accessible to the caller
      const isOwnedByUser = parentTask.userId === userId;
      const isSharedWithUser = parentTask.sharedWithId === userId;

      if (!isOwnedByUser && !isSharedWithUser) {
        return res
          .status(403)
          .json({ message: "Parent task is not accessible" });
      }

      // ensure the subtask is owned by the parent owner and inherits sharing
      userId = parentTask.userId;
      sharedWithId = parentTask.sharedWithId ?? null;
    }

    const task = taskRepository.create({
      title,
      description,
      status,
      priority,
      userId,
      parentId: parentTaskId,
      sharedWithId: sharedWithId,
    });

    await taskRepository.save(task);

    res.status(201).json(sanitizeTask(task));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating task", error });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let where: FindOptionsWhere<Task>[] = [
      { userId },
      { sharedWithId: userId },
    ];

    const tasks = await taskRepository.find({
      where: where,
      order: { createdAt: "DESC" },
      relations: ["subtasks", "user", "sharedWith"],
    });
    res.json(tasks.map(sanitizeTask));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

export const getCompletedTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tasks = await taskRepository.find({
      where: [
        {
          userId,
          status: TaskStatus.DONE,
        },
        { sharedWithId: userId, status: TaskStatus.DONE },
      ],
      order: {
        completedAt: "DESC",
      },
      relations: ["subtasks", "user", "sharedWith"],
    });

    res.json(tasks.map(sanitizeTask));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching completed tasks", error });
  }
};

export const getTasksNoParents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tasks = await taskRepository.find({
      where: [
        {
          userId,
          parentId: IsNull(),
        },
        { sharedWithId: userId, parentId: IsNull() },
      ],
      order: { createdAt: "DESC" },
      relations: ["subtasks", "user", "sharedWith"],
    });
    res.json(tasks.map(sanitizeTask));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

export const getSingleTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await taskRepository.findOne({
      where: [
        {
          userId,
          id: Number(id),
        },
        { sharedWithId: userId, id: Number(id) },
      ],
      order: { createdAt: "DESC" },
      relations: ["subtasks", "user", "sharedWith"],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(sanitizeTask(task));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching task", error });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const { title, description, priority, status, plannedFor, sharedWithId } =
      req.body;

    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await taskRepository.findOne({
      where: [
        { id: parseInt(id), userId },
        { id: parseInt(id), sharedWithId: userId },
      ],
      relations: ["user", "sharedWith"],
    });

    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or you are not the owner" });

    if (task.userId !== userId && task.sharedWithId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (task.userId !== userId) {
      if (
        title !== undefined ||
        description !== undefined ||
        priority !== undefined ||
        plannedFor !== undefined ||
        (sharedWithId !== undefined && sharedWithId !== task.sharedWithId)
      ) {
        return res
          .status(403)
          .json({ message: "You can only update the status of this task" });
      }
    }

    if (userId === task.userId && sharedWithId !== undefined) {
      task.sharedWithId = sharedWithId;

      await taskRepository.update(
        { parentId: task.id, userId: task.userId },
        { sharedWithId: sharedWithId },
      );
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;

    if (status !== undefined && status !== task.status) {
      if (status === TaskStatus.DONE) {
        task.completedAt = new Date();
      } else if (task.status === TaskStatus.DONE) {
        task.completedAt = null;
      }
      task.status = status;
    }

    if (plannedFor !== undefined) task.plannedFor = plannedFor;

    await taskRepository.save(task);

    res.json(sanitizeTask(task));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating task", error });
  }
};

export const shareTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sharedWithId } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await taskRepository.findOne({
      where: { id: Number(id), userId },
      relations: ["subtasks"],
    });

    if (!task)
      return res
        .status(404)
        .json({ message: "Task not found or you are not the owner" });

    await taskRepository.save({
      ...task,
      sharedWithId,
    });

    if (task.subtasks.length > 0) {
      await taskRepository.update(
        { parentId: task.id, userId: task.userId },
        { sharedWithId },
      );
    }

    const updatedTask = await taskRepository.findOne({
      where: { id: Number(id) },
      relations: ["subtasks", "user", "sharedWith"],
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(sanitizeTask(updatedTask));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sharing task", error });
  }
};

export const updateTaskParent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { newParentId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const taskId = Number(id);
    const parentId = Number(newParentId);

    const newParent = await taskRepository.findOne({
      where: { id: parentId, userId },
    });

    if (!newParent) {
      return res.status(404).json({ message: "Parent task not found" });
    }

    const updateResult = await taskRepository.update(
      { id: taskId, userId },
      { parentId: parentId },
    );

    if (updateResult.affected === 0) {
      return res.status(404).json({ message: "Parent task not found" });
    }

    res.json({
      message: "Parent task succesfully updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating parent task", error });
  }
};

export const toggleSubtasks = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { subtasks } = req.body;
  const parentId = Number(id);
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager
      .createQueryBuilder()
      .update(Task)
      .set({ parentId: null })
      .where({ parentId, userId })
      .execute();

    if (subtasks && subtasks.length > 0) {
      await queryRunner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ parentId: parentId })
        .where({ id: In(subtasks), userId })
        .execute();
    }

    await queryRunner.commitTransaction();
    res.json({ message: "Subtasks successfully updated" });
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error(err);
    res.status(500).json({ message: "Error updating subtasks", error: err });
  } finally {
    await queryRunner.release();
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return res.status(400).json({ message: "ID is required" });
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await taskRepository.findOneBy({ id: parseInt(id), userId });

    if (!task) return res.status(404).json({ message: "Task not found" });

    await taskRepository.remove(task);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting task", error });
  }
};

export const getMyDay = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dateParam = req.query.date as string;
    const today = dateParam || new Date().toISOString().split("T")[0];

    const tasks = await taskRepository.find({
      where: [
        {
          userId,
          plannedFor: today as any,
        },
        { sharedWithId: userId, plannedFor: today as any },
      ],
      relations: ["subtasks", "user", "sharedWith"],
      order: { priority: "DESC" },
    });

    res.json(tasks.map(sanitizeTask));
  } catch (error) {
    res.status(500).json({ message: "Error fetching My Day tasks", error });
  }
};

export const batchUpdatePlannedDate = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { updates } = req.body as {
      updates: { id: number; plannedFor: string | null }[];
    };
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updatePromises = updates.map((item) =>
      taskRepository.update(
        { id: item.id, userId },
        { plannedFor: item.plannedFor },
      ),
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Batch date update successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during batch date update", error });
  }
};
