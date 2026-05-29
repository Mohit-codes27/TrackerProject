export interface User {
    id: string;
    name: string;
    email: string;
    targetedRole: string;
    experienceLevel: string;
}

export interface CodingLog {
    id: string;
    userId: string;
    platform: "LeetCode" | "GFG" | "Codeforces";
    problemName: string;
    problemLink?: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topic: string;
    timeSpentMinutes: number;
    attempts: number;
    solvedAt: string;
    createdAt: string;
}

export interface ProjectLog {
    id: string;
    userId: string;
    projectName: string;
    category: "Frontend" | "Backend" | "FullStack";
    techStack: string[];
    description?: string;
    hoursLogged: number;
    loggedAt: string;
    createdAt: string;
}

export interface WeeklySummary {
    totalProblems: number;
    easy: number;
    medium: number;
    hard: number;
    totalProjectHours: number;
    productivityScore: number;
    weekStart: string;
    weekEnd: string;
}