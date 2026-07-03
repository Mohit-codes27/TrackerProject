import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import codingRoutes from "./modules/coding/coding.routes";
import projectRoutes from "./modules/projects/projects.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

//routes
app.use("/auth", authRoutes);
app.use("/coding", codingRoutes);
app.use("/projects", projectRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/dashboard", dashboardRoutes);

//Error handlern
app.use(errorHandler);

app.listen(Number(env.PORT), () => {
  console.log(`Server running on port ${env.PORT}`);
});