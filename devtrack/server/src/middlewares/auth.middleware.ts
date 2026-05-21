import { Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

declare global{
    namespace Express{
        interface Request{
            user?: {
                id: string;
                role: string;
            }
        }
    }
};

export const protect = (req: Request, res: Response, next: NextFunction)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader && !authHeader?.startsWith("Bearer ")){
        res.status(401);
        throw new Error("Unauthorized, no token");
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
            id: string;
            role: string;
        }

        req.user = decoded;
        next();
    }catch(err){
        res.status(401);
        throw new Error("Not Authorized, token failed")
    }
}