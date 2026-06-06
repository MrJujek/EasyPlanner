import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ORMColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Board } from "./Board";
import { Task } from "../Task";

@Entity("columns")
export class KanbanColumn {
  @PrimaryGeneratedColumn()
  id!: number;

  @ORMColumn()
  title!: string;

  @ORMColumn()
  boardId!: number;

  @ManyToOne(() => Board, (board) => board.columns, { onDelete: "CASCADE" })
  @JoinColumn({ name: "boardId" })
  board!: Board;

  @ORMColumn({ type: "int", default: 0 })
  wipLimit!: number;

  @ORMColumn({ type: "int" })
  order!: number;

  @OneToMany(() => Task, (task) => task.column)
  tasks!: Task[];
}
