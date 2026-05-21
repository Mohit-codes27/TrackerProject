import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerUser, loginUser } from "./auth.service";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { generateAccessToken } from "../../utils/token.utils";

const cookieOptions = {
    httpOnly: true,
    secure: false, //Make it true in prod
    sameSite: "lax" as const,
    maxAge: 7*24*60*60*1000,
};

export const register = asyncHandler(async(req: Request, res: Response) =>{
    const user = await registerUser(req.body);
    res.status(201).json({
        success: true,
        message: "Registered successfully",
        user: { id: user.id, name: user.name, email: user.email}
    });
});

export const login = asyncHandler(async(req: Request, res: Response)=>{
    const { user, refreshToken, accessToken} = await loginUser(req.body);
    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(200).json({
        success: true,
        accessToken,
        user: { id: user.id, name: user.name, email: user.email}
    });
});

export const refresh = asyncHandler(async(req:Request, res:Response)=>{
    const token = req.cookies.refreshToken;
    if(!token){
        res.status(401);
        throw new Error("No refresh token");
    }

    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as {id: string};

    const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1);

    if(!user || user.refreshToken !== token){
        res.status(403);
        throw new Error("Invalid refresh token");
    }

    const accessToken = generateAccessToken(user.id);
    res.status(200).json({ success: true, accessToken});
});

export const logout = asyncHandler(async(req: Request, res: Response) => {
    await db
    .update(users)
    .set({ refreshToken: null})
    .where(eq(users.id, req.user!.id))

    res.clearCookie("refreshToken");
    res.status(200).json({success: true, message: "Logged out successfully"});
});

export const getMe = asyncHandler(async(req: Request, res: Response)=>{
    const [user] = await db
    .select({
        id: users.id,
        name: users.name,
        email: users.email,
        targetedRole: users.targetedRole,
        experienceLevel: users.experienceLevel,
    })
    .from(users)
    .where(eq(users.id, req.user!.id))
    .limit(1);

    res.status(200).json({success: true, user});
})