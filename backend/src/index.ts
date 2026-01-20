import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import type { Request, Response, NextFunction } from "express";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT;

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use("/", taskRoutes);

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`EasyPlanner running on port ${PORT}`));
  })
  .catch((err) => console.log("Database connection error: ", err));
