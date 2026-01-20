import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../model/User";

const userRepository = AppDataSource.getRepository(User);
const generateTokens = (userId: number) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        const existingEmail = await userRepository.findOneBy({ email });
        const existingUsername = await userRepository.findOneBy({ username });

        const errors: Record<string, string> = {};
        if (existingUsername)
            errors.username = "This username is already in use";
        if (existingEmail) errors.email = "This email is already in use";

        if (Object.keys(errors).length > 0) {
            return res.status(409).json({ errors });
        }

        const hashedPassword = await Bun.password.hash(password);
        const user = userRepository.create({
            username,
            email,
            password_hash: hashedPassword,
        });

        await userRepository.save(user);
        res.status(201).json({
            message: "User registered",
            id: user.id,
        });
    } catch (err) {
        res.status(400).json({ error: "Server error during registration" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await userRepository.findOneBy({ email });

    if (user && (await Bun.password.verify(password, user.password_hash))) {
        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            {
                expiresIn: "15m",
            }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        const userData = { username: user.username, email: user.email };

        res.json({ accessToken, refreshToken, user: userData });
    } else {
        res.status(401).json({ error: "Invalid email or password" });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) return res.status(401).send();

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number;
        };
        res.json(generateTokens(payload.userId));
    } catch {
        res.status(403).send();
    }
};
