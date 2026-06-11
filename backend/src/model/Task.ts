import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Board } from "./kanban/Board";
import { KanbanColumn } from "./kanban/KanbanColumn";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({
    type: "text",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({
    type: "text",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ nullable: true })
  sharedWithId?: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sharedWithId" })
  sharedWith?: User;

  // kanban

  @Column({ nullable: true })
  boardId!: number | null;

  @ManyToOne(() => Board, (board) => board.tasks, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "boardId" })
  board!: Board | null;

  @Column({ nullable: true })
  columnId!: number | null;

  @ManyToOne(() => KanbanColumn, (column) => column.tasks, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "columnId" })
  column!: KanbanColumn | null;

  // end kanban

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "date", nullable: true })
  plannedFor?: Date | null;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date | null;

  @Column({ nullable: true })
  parentId: number | null;

  @ManyToOne(() => Task, (task) => task.subtasks, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parentId" })
  parent: Task;

  @OneToMany(() => Task, (task) => task.parent)
  subtasks: Task[];
}
