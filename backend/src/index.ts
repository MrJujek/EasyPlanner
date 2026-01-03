import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express from "express";
import cors from "cors";
import { register, login, refresh } from "./controllers/authController";
import { AppDataSource } from "./config/data-source";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.post("/register", register);
app.post("/login", login);
app.post("/refresh", refresh);

AppDataSource.initialize()
    .then(() => {
        app.listen(PORT, () =>
            console.log(`EasyPlanner running on port ${PORT}`)
        );
    })
    .catch((err) => console.log("Database connection error: ", err));
