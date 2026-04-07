import type { Request, Response } from "express";
import catchAsync from "../helpers/catchAsync";
import workSpaceService from "../services/workspace.service";
import type { CreateWorkspace, UpdateWorkspace } from "../validators/workspace.validator";

const workSpaceController = {
    create: catchAsync(async (req: Request, res: Response) => {
        const body = req.body as CreateWorkspace;
        const result = await workSpaceService.create(body, req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    getAll: catchAsync(async (req: Request, res: Response) => {
        const result = await workSpaceService.getAll(req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    getById: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Workspace ID is required",
            });
        }
        const result = await workSpaceService.getById(id);
        return res.status(result.statusCode).json(result.body);
    }),

    update: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Workspace ID is required",
            });
        }
        const body = req.body as UpdateWorkspace;
        const result = await workSpaceService.update(id, body, req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    delete: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Workspace ID is required",
            });
        }
        const result = await workSpaceService.delete(id, req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    select: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Workspace ID is required",
            });
        }
        const result = await workSpaceService.select({ id, user: req.user, session: req.session });
        return res.status(result.statusCode).json(result.body);
    }),

    members: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Workspace ID is required",
            });
        }
        const result = await workSpaceService.members({ id, user: req.user });
        return res.status(result.statusCode).json(result.body);
    }),

};

export default workSpaceController;