import api from "./axiosInstance";
import { Task, CreateTaskDto, UpdateTaskDto } from "../types/task";

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/tasks");
  return response.data;
};

export const getCompletedTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/history");
  return response.data;
};

export const getTasksNoParents = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/subtasks");
  return response.data;
};

export const getTask = async (id: number): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: CreateTaskDto): Promise<Task> => {
  const response = await api.post<Task>("/tasks", data);
  return response.data;
};

export const updateTask = async (
  id: number,
  data: UpdateTaskDto,
): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const setSubtasks = async (
  taskId: number,
  newSubtasks: number[],
): Promise<void> => {
  await api.put<Task>(`/subtasks/${taskId}`, { subtasks: newSubtasks });
};

export const getMyDayTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/my-day");
  return response.data;
};

export const batchUpdateMyDay = async (
  updates: { id: number; plannedFor: string | null }[],
): Promise<void> => {
  await api.patch("/my-day", { updates });
};

export const shareTask = async (
  taskId: number,
  sharedWithId: number,
): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${taskId}/share`, {
    sharedWithId,
  });
  return response.data;
};
