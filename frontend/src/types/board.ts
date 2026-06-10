import { Task } from "./task";
import { User } from "./user";

export interface BoardMember {
  userId: number;
  boardId: number;
  role: "ADMIN" | "MEMBER";
  user: User;
}

export interface KanbanColumn {
  id: number;
  title: string;
  boardId: number;
  wipLimit: number;
  order: number;
  tasks: Task[];
}

export interface Board {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  ownerId: number;
  owner?: User;
  columns?: KanbanColumn[];
  members?: BoardMember[];
}
