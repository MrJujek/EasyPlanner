import { type Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../model/Task";
import { type AuthRequest } from "../middleware/authMiddleware";
import { In, IsNull, Not } from "typeorm";

const taskRepository = AppDataSource.getRepository(Task);

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, parentId } = req.body;
    const userId = req.user?.userId;
    const parentTaskId = parentId ? Number(parentId) : null;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = taskRepository.create({
      title,
      description,
      status,
      priority,
      userId,
      parentId: parentTaskId,
    });

    await taskRepository.save(task);
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating task", error });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tasks = await taskRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      relations: ["subtasks"],
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

export const getTasksNoParents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tasks = await taskRepository.find({
      where: {
        userId,
        parentId: IsNull(),
      },
      order: { createdAt: "DESC" },
      // relations: ["subtasks"],
    });
    res.json(tasks);
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
      where: {
        userId,
        id: Number(id),
      },
      order: { createdAt: "DESC" },
      relations: ["subtasks"],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching task", error });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID is required" });
    const { title, description, priority, status } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const task = await taskRepository.findOneBy({ id: parseInt(id), userId });

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    await taskRepository.save(task);
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating task", error });
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
      { parentId: parentId }
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
  const { subtaskIds } = req.body;
  const parentId = Number(id);
  const userId = req.user?.userId;

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.createQueryBuilder()
      .update(Task)
      .set({ parentId: null })
      .where({ parentId, userId })
      .execute();

    if (subtaskIds && subtaskIds.length > 0) {
      await queryRunner.manager.createQueryBuilder()
        .update(Task)
        .set({ parentId: parentId })
        .where({ subtaskIds, userId })
        .execute();
    }

    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
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
