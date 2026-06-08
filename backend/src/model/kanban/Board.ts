import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { User } from "../User";
import { KanbanColumn } from "./KanbanColumn";
import { BoardMember } from "./BoardMember";
import { Task } from "../Task";

@Entity("boards")
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  ownerId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "ownerId" })
  owner!: User;

  @OneToMany(() => KanbanColumn, (column) => column.board)
  columns!: KanbanColumn[];

  @OneToMany(() => BoardMember, (member) => member.board)
  members!: BoardMember[];

  @OneToMany(() => Task, (task) => task.board)
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;
}
