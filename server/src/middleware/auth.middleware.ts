import type { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import WorkSpaceModel from "../models/workspace.model";
import WorkspaceMemberModel from "../models/workspaceMember.model";
import session from "express-session";

declare global {
    namespace Express {
        interface Request {
            user?: any;
            workspace?: any;
        }
    }
}

interface AuthMiddlewarePayload {
    requireWorkspace?: boolean;
}

const authMiddleware = (payload: AuthMiddlewarePayload = {}) => async (req: Request, res: Response, next: NextFunction) => {
    const reqWorkSpace = payload?.requireWorkspace ?? true;
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Please log in to access this resource",
        });
    }

    const user = await UserModel.findById(req.session.userId);
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: User not found",
        });
    }

    const { password, ...userData } = user.toObject();
    req.user = userData; // Attach user to request object for downstream use
    if (!reqWorkSpace) {
        return next();
    }

    if (!req.session.workspaceId) {
        return res.status(400).json({
            success: false,
            message: "Bad Request: Workspace not selected",
        });
    }

    const workspace = await WorkSpaceModel.findById(req.session.workspaceId);
    if (!workspace) {
        return res.status(404).json({
            success: false,
            message: "Workspace not found",
        });
    }
    let workspaceMember = await WorkspaceMemberModel.findOne({
        workspaceId: req.session.workspaceId,
        userId: req.session.userId,
        isActive: true,
    });
    if (!workspaceMember) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You are not a member of this workspace",
        });
    }

    workspaceMember = workspaceMember.toObject();
    delete workspaceMember._id;
    req.workspace = workspace; // Attach workspace to request object for downstream use
    req.user = {
        ...req.user,
        ...workspaceMember,
    };

    next();
};

export default authMiddleware;