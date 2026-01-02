import { createContext, useContext } from "react";

export interface AuthContextType {
    token: string | null;
    username: string | null;
    login: (
        accessToken: string,
        refreshToken: string,
        username: string
    ) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
