import { useState, ReactNode } from "react";
import { AuthContext } from "./AuthContextType";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState(localStorage.getItem("accessToken"));
    const [username, setUsername] = useState(localStorage.getItem("username"));

    const login = (accessToken: string, refreshToken: string, user: string) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("username", user);
        setToken(accessToken);
        setUsername(user);
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ token, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
