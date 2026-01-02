import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../model/User";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DB_URI,
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
