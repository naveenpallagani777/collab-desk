import type { Request, Response } from "express";
import catchAsync from "../helpers/catchAsync";
import invitationService from "../services/invitation.service";
import type { AcceptInvitation, CreateInvitation, UpdateInvitation } from "../validators/invitation.validator.ts";

const invitationController = {
    create: catchAsync(async (req: Request, res: Response) => {
        const body = req.body as CreateInvitation;
        const result = await invitationService.create(body, req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    update : catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invitation ID is required",
            });
        }
        const body = req.body as UpdateInvitation;
        const result = await invitationService.update(id, body, req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    getAll: catchAsync(async (req: Request, res: Response) => {
        const result = await invitationService.getAll(req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    getById: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invitation ID is required",
            });
        }
        const result = await invitationService.getById(id, req.user);
        return res.status(result.statusCode).json(result.body);
    }),

    accept: catchAsync(async (req: Request, res: Response) => {
        const body = req.body as AcceptInvitation;
        const result = await invitationService.accept(body, req.user, req.session);
        return res.status(result.statusCode).json(result.body);
    }),

    delete: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Invitation ID is required",
            });
        }
        const result = await invitationService.delete(id, req.user);
        return res.status(result.statusCode).json(result.body);
    }),
};

export default invitationController;