import { useState, ReactNode } from "react";
import { AuthContext } from "./AuthContextType";
import api from "../api/axiosInstance";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState(localStorage.getItem("accessToken"));
    const [username, setUsername] = useState(localStorage.getItem("username"));

    const login = async (email: string, password: string): Promise<void> => {
        const res = await api.post("/login", { email, password });
        const { accessToken, refreshToken, username: user } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("username", user);

        setToken(accessToken);
        setUsername(user || email);
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
        setUsername(null);
    };

    return (
        <AuthContext.Provider
            value={{ token, username, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
