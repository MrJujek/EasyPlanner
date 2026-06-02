import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../model/User";
import { Task } from "../model/Task";
import { Friendship } from "../model/Friendship";
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
  entities: [User, Task, Friendship],
  migrations: [],
  subscribers: [],
  extra: {
    user: process.env.DB_USER,
  },
});
