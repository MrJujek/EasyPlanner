import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Board } from "./Board";
import { User } from "../User";

export enum BoardRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

@Entity("board_members")
export class BoardMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  boardId!: number;

  @ManyToOne(() => Board, (board) => board.members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "boardId" })
  board!: Relation<Board>;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({
    type: "text",
    enum: BoardRole,
    default: BoardRole.MEMBER,
  })
  role!: BoardRole;

  @CreateDateColumn()
  createdAt!: Date;
}
