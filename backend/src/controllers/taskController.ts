import { type Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../model/Task";
import { type AuthRequest } from "../middleware/authMiddleware";
import { In } from "typeorm";

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
      // relations: ["subtasks"],
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
    res
      .status(500)
      .json({ message: "Error updating parent task", error });
  }
};

export const toggleSubtasks = async (req: AuthRequest, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { subtaskIds } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const parentId = Number(id);

    await queryRunner.manager.update(
      Task,
      { parentId, userId },
      { parentId: null }
    );

    if (subtaskIds && subtaskIds.length > 0) {
      await queryRunner.manager.update(
        Task,
        {
          id: In(subtaskIds),
          userId,
        },
        { parentId }
      );
    }

    await queryRunner.commitTransaction();
    res.json({ message: "Subtasks list succesfully updated" });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating subtasks list", error });
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
