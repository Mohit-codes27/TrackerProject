import bcrypt from "bcrypt";
import {db} from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.utils";
import type { RegisterInput, LoginInput} from "./auth.schema";

export const registerUser = async(data: RegisterInput) =>{
    const {name, email, password} = data;
    const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

    if(existing.length>0){
        throw new Error("Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash})
    .returning();

    return newUser;
}

export const loginUser = async(data: LoginInput) => {
    const {email, password} = data;
    const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

    if(!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch) throw new Error("Invalid email or password");

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await db
    .update(users)
    .set({refreshToken})
    .where(eq(users.id, user.id))

    return { user, accessToken, refreshToken}
}