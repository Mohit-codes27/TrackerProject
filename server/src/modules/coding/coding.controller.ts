import { Request, Response} from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createCodingLog, getCodingLogs, getCodingLogById, updateCodingLog, deleteCodingLog } from "./coding.service";

export const createLog = asyncHandler(async(req: Request, res: Response)=>{
    const log = await createCodingLog(req.user!.id, req.body);
    res.status(201).json({
        success: true,
        message: "Coding log created successfully",
        data: log,
    });
});

export const getLogs = asyncHandler(async(req: Request, res: Response)=>{
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await getCodingLogs(req.user!.id, page, limit);
    res.status(200).json({
        success: true,
        message:"Coding logs fetched successfully",
        data: result
    })
})

export const getLog = asyncHandler(async(req:Request, res:Response)=>{
    const id = req.params.id as string;
    const log = await getCodingLogById(req.user!.id, id);
    if(!log){
        res.status(404);
        throw new Error("Coding log not found");
    }
    res.status(200).json({
        success: true,
        message:"Coding log fetched successfully",
        data:log,
    })
})

export const updateLog = asyncHandler(async(req:Request, res:Response)=>{
    const id = req.params.id as string;
    const log = await updateCodingLog(req.user!.id, id, req.body);
    if(!log){
        res.status(404);
        throw new Error("Coding log not found");
    }
    res.status(200).json({
        success: true,
        message:"Coding log updated successfully",
        data:log,
    })
})

export const deleteLog = asyncHandler(async(req:Request, res:Response)=>{
    const id = req.params.id as string;
    const log = await deleteCodingLog(req.user!.id, id);
    if(!log){
        res.status(404);
        throw new Error("Coding log not found");
    }
    res.status(200).json({
        success: true,
        message:"Coding log deleted successfully",
    })
})