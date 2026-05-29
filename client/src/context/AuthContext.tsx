import { createContext, useContext, useEffect, useState, ReactNode, Children } from "react";
import api from "../api/axios";
import type { User } from "../types";

interface AuthContextType{
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: {
    children: ReactNode
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");
            if(!token){
                setLoading(false);
                return;
            }
            try{
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            }catch{
                setUser(null);
            }finally{
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    const login = async(email: string, password: string) => {
        const res = await api.post("/auth/login", {email, password});
        localStorage.setItem("accessToken", res.data.accessToken);
        setUser(res.data.user);
    }

    const logout = async()=>{
        await api.post("/auth/logout");
        localStorage.removeItem("accessToken");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}