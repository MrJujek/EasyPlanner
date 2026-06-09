import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { User } from "../User";
import { Task } from "../Task";
import { Board } from "./Board";
import { KanbanColumn } from "./KanbanColumn";

@Entity("task_activity_logs")
export class TaskActivityLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  taskId!: number;

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskId" })
  task!: Relation<Task>;

  @Column()
  userId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: Relation<User>;

  @Column()
  boardId!: number;

  @ManyToOne(() => Board, { onDelete: "CASCADE" })
  @JoinColumn({ name: "boardId" })
  board!: Relation<Board>;

  @Column({ nullable: true })
  fromColumnId!: number | null;

  @ManyToOne(() => KanbanColumn, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "fromColumnId" })
  fromColumn!: Relation<KanbanColumn> | null;

  @Column()
  toColumnId!: number;

  @ManyToOne(() => KanbanColumn, { onDelete: "CASCADE" })
  @JoinColumn({ name: "toColumnId" })
  toColumn!: Relation<KanbanColumn>;

  @CreateDateColumn()
  timestamp!: Date;
}
