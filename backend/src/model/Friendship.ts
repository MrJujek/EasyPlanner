import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum FriendshipStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

@Entity("friendships")
export class Friendship {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  requesterId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "requesterId" })
  requester!: User;

  @Column()
  recipientId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "recipientId" })
  recipient!: User;

  @Column({
    type: "text",
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status!: FriendshipStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
