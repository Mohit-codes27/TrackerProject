import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId}, env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
