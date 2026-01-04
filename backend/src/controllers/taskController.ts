import { type Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../model/Task";
import { type AuthRequest } from "../middleware/authMiddleware";

const taskRepository = AppDataSource.getRepository(Task);

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority, status } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const task = taskRepository.create({
            title,
            description,
            priority,
            status,
            userId
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
            order: { createdAt: "DESC" }
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching tasks", error });
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
