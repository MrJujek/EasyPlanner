import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../model/User";
import { Task } from "../model/Task";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [User, Task],
    migrations: [],
    subscribers: [],
    extra: {
        user: process.env.DB_USER,
    }
});
