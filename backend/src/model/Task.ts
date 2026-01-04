
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

export enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
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
        default: TaskStatus.TODO
    })
    status!: TaskStatus;

    @Column({
        type: "text", 
        enum: TaskPriority,
        default: TaskPriority.MEDIUM
    })
    priority!: TaskPriority;

    @Column()
    userId!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user!: User;
    
    @CreateDateColumn()
    createdAt!: Date;
}
