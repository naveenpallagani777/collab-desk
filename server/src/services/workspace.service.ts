import type { CreateWorkspace, UpdateWorkspace } from "../validators/workspace.validator";
import { createWorkspaceSchema } from "../validators/workspace.validator";
import WorkSpaceModel from "../models/workspace.model";
import WorkspaceMemberModel from "../models/workspaceMember.model";
import curdService from "./crud.service";
import utilsService from "./utils.service";


const workspaceCrud = curdService(WorkSpaceModel);

const getUserId = (user: any): string => String(user?.userId ?? user?._id ?? "");

const workSpaceService = {
    create: async (data: CreateWorkspace, user: any) => {
        // Validate the input data    
        const parsedData = createWorkspaceSchema.safeParse(data);
        if (!parsedData.success) {
            throw new utilsService.CustomAppError(
                "Invalid input data",
                400,
                { issues: parsedData.error.issues }
            );
        }
        const userId = getUserId(user);

        const workspace = await workspaceCrud.createOne({
            data: {
                ...data,
                ownerId: userId,
            }
        });

        await WorkspaceMemberModel.create({
            workspaceId: String(workspace.data._id),
            userId,
            standardRole: "OWNER",
            workspaceEmail: user.email,
            displayName: `${user.firstName} ${user.lastName}`,
        });

        return {
            statusCode: 201,
            body: workspace,
        };
    },

    getAll: async (user: any) => {
        const userId = getUserId(user);

        const memberships = await WorkspaceMemberModel.find({
            userId,
            isActive: true,
        })
            .populate({
                path: "workspaceId",
                select: "name description logoUrl bannerUrl isDeleted",
            })
            .lean();

        const workspaces = memberships
            .filter((item: any) => item.workspaceId && !item.workspaceId.isDeleted)
            .map((item: any) => ({
                _id: String(item._id),
                workspaceId: String(item.workspaceId._id),
                userId: String(item.userId),
                standardRole: item.standardRole,
                isActive: item.isActive,
                displayName: item.displayName,
                workspaceEmail: item.workspaceEmail,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                workspace: {
                    _id: String(item.workspaceId._id),
                    name: item.workspaceId.name,
                    description: item.workspaceId.description,
                    logoUrl: item.workspaceId.logoUrl,
                    bannerUrl: item.workspaceId.bannerUrl,
                },
            }));

        return {
            statusCode: 200,
            body: {
                success: true,
                message: "Fetched all workspaces successfully!",
                data: {
                    workspaces,
                    invitations: [] // TODO: Implement invitations and include them here
                },
            },
        };
    },

    getById: async (id: string) => {
        const workspace = await workspaceCrud.getOne({ id });
        return {
            statusCode: 200,
            body: workspace,
        };
    },

    update: async (id: string, data: UpdateWorkspace, user: any) => {
        const updatedWorkspace = await workspaceCrud.updateOne({ id, data });
        return {
            statusCode: 200,
            body: {
                success: true,
                message: `Workspace with ID '${id}' updated successfully!`,
                data: updatedWorkspace.data,    
            },
        };
    },

    delete: async (id: string, user: any) => {
        await workspaceCrud.updateOne({ 
            id, 
            data: { isDeleted: true },
            // hook: {
            //     beforeUpdate: async (existingDoc: any, { allowedRoles }: any) => {
            //         if (existingDoc.isDeleted) {
            //             throw new utilsService.CustomAppError(
            //                 "Workspace is already deleted",
            //                 400
            //             );
            //         }
            //     },
            // },
            context: {
                allowedRoles: ["OWNER"],
            }
        });
        return {
            statusCode: 200,
            body: {
                success: true,
                message: `Workspace with ID '${id}' deleted successfully!`,
            },
        };
    },

    select: async (payload: { id: string; user: any; session?: any }) => {
        const { id, user, session } = payload;
        const userId = getUserId(user);

        const membership = await WorkspaceMemberModel.findOne({
            workspaceId: id,
            userId,
        });

        if (!membership) {
            throw new utilsService.CustomAppError(
                "You are not a member of this workspace",
                403
            );
        }

        const workspace = await workspaceCrud.getOne({ id });

        if (session) {
            session.workspaceId = id;
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                message: "Workspace selected successfully",
                data: workspace.data,
            },
        };
    },

    members: async (payload: { id: string; user: any }) => {
        const { id, user } = payload;
        const userId = getUserId(user);

        const requesterMembership = await WorkspaceMemberModel.findOne({
            workspaceId: id,
            userId,
            isActive: true,
        });

        if (!requesterMembership) {
            throw new utilsService.CustomAppError(
                "You are not a member of this workspace",
                403
            );
        }

        const members = await WorkspaceMemberModel.find({
            workspaceId: id,
            isActive: true,
        })
            .populate({
                path: "userId",
                select: "username firstName lastName email",
            })
            .sort({ createdAt: 1 })
            .lean();

        return {
            statusCode: 200,
            body: {
                success: true,
                message: "Workspace members fetched successfully",
                data: {
                    members: members.map((member: any) => ({
                        _id: String(member._id),
                        workspaceId: String(member.workspaceId),
                        userId: String(member.userId?._id || member.userId),
                        standardRole: member.standardRole,
                        isActive: member.isActive,
                        displayName: member.displayName,
                        workspaceEmail: member.workspaceEmail,
                        createdAt: member.createdAt,
                        updatedAt: member.updatedAt,
                        user: member.userId && typeof member.userId === "object"
                            ? {
                                _id: String(member.userId._id),
                                username: member.userId.username,
                                firstName: member.userId.firstName,
                                lastName: member.userId.lastName,
                                email: member.userId.email,
                            }
                            : undefined,
                    })),
                },
            },
        };
    },
};

export default workSpaceService;