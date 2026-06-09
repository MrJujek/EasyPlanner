import api from "./axiosInstance";
import { Board } from "../types/board";

export const getBoards = async (): Promise<Board[]> => {
  const response = await api.get<Board[]>("/boards");
  return response.data;
};

export const createBoard = async (
  title: string,
  description?: string,
): Promise<Board> => {
  const response = await api.post<Board>("/boards", { title, description });
  return response.data;
};

export const getBoard = async (boardId: number): Promise<Board> => {
  const response = await api.get<Board>(`/boards/${boardId}`);
  return response.data;
};

export const moveTask = async (
  boardId: number,
  taskId: number,
  targetColumnId: number,
): Promise<void> => {
  await api.patch(`/boards/${boardId}/tasks/${taskId}/move`, {
    targetColumnId,
  });
};
