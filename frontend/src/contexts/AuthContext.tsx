import { useState, ReactNode } from "react";
import { AuthContext, User } from "./AuthContextType";
import api from "../api/axiosInstance";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState(localStorage.getItem("accessToken"));
    const [user, setUser] = useState<User | null>(
        localStorage.getItem("user")
            ? (JSON.parse(localStorage.getItem("user")!) as User | null)
            : null
    );

    const login = async (email: string, password: string): Promise<void> => {
        const res = await api.post("/login", { email, password });
        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        setToken(accessToken);
        setUser(user);
    };

    const register = async (
        username: string,
        email: string,
        password: string
    ): Promise<void> => {
        await api.post("/register", {
            username,
            email,
            password,
        });
    };

    const logout = async () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
