import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { register, login, refresh } from "./src/controllers/authController";
import { AppDataSource } from "./src/config/data-source";

dotenv.config();

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
