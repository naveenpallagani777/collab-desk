import InvitationModel from "../models/invitation.model";
import WorkspaceMemberModel from "../models/workspaceMember.model";
import config from "../config";
import type { AcceptInvitation, CreateInvitation, UpdateInvitation } from "../validators/invitation.validator";
import curdService from "./crud.service";
import utilsService from "./utils.service";

const invitationCrud = curdService(InvitationModel);

const getUserId = (user: any): string => String(user?.userId ?? user?._id ?? "");
const getWorkspaceId = (user: any): string => String(user?.workspaceId ?? "");

const toRole = (role: string) => role.toUpperCase();

const toBase64Url = (value: string) =>
    Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = normalized.length % 4;
    const padded = paddingLength === 0 ? normalized : `${normalized}${"=".repeat(4 - paddingLength)}`;
    return Buffer.from(padded, "base64").toString("utf8");
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const resolveInvitePayload = (payload: AcceptInvitation) => {
    if (payload.inviteToken) {
        try {
            const parsed = JSON.parse(fromBase64Url(payload.inviteToken)) as {
                invitationId?: string;
                workspaceId?: string;
                email?: string;
                role?: string;
            };

            if (!parsed.invitationId || !parsed.workspaceId || !parsed.email) {
                throw new Error("Missing invite payload fields");
            }

            return {
                invitationId: parsed.invitationId,
                workspaceId: parsed.workspaceId,
                email: parsed.email,
                role: parsed.role,
            };
        } catch {
            throw new utilsService.CustomAppError("Invalid invite token", 400);
        }
    }

    return {
        invitationId: payload.invitationId || "",
        workspaceId: payload.workspaceId || "",
        email: payload.email || "",
        role: payload.role,
    };
};

const invitationService = {
    create: async (data: CreateInvitation, user: any) => {
        const userId = getUserId(user);
        const workspaceId = getWorkspaceId(user);

        if (!workspaceId) {
            throw new utilsService.CustomAppError("Workspace is required to create an invitation", 400);
        }

        const invitation = await invitationCrud.createOne({
            data: {
                email: data.email,
                role: toRole(data.role),
                workspaceId,
                invitedBy: userId,
            }
        });

        const invitationId = String(invitation.data._id);
        const invitePayload = {
            invitationId,
            workspaceId,
            email: data.email,
            role: toRole(data.role),
        };

        const query = new URLSearchParams({
            inviteToken: toBase64Url(JSON.stringify(invitePayload)),
        });

        const inviteUrl = `${config.clientAppUrl}/invite?${query.toString()}`;

        const updatedInvitation = await invitationCrud.updateOne({
            id: invitationId,
            data: {
                inviteUrl,
            },
        });

        return {
            statusCode: 201,
            body: updatedInvitation,
        };
    },

    getAll: async (user: any) => {
        const userId = getUserId(user);
        const invitations = await InvitationModel.find({ invitedBy: userId })
            .sort({ createdAt: -1 })
            .lean();

        return {
            statusCode: 200,
            body: {
                success: true,
                message: "Fetched all invitations successfully!",
                data: {
                    invitations,
                }
            },
        };
    },

    getById: async (id: string, user: any) => {
        const userId = getUserId(user);

        const invitation = await InvitationModel.findOne({ _id: id, invitedBy: userId }).lean();

        if (!invitation) {
            throw new utilsService.CustomAppError("Invitation not found", 404);
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                message: "Invitation fetched successfully",
                data: invitation,
            },
        };
    },

    accept: async (payload: AcceptInvitation, user: any, session?: any) => {
        const userId = getUserId(user);
        const userEmail = String(user?.email || "");

        if (!userEmail) {
            throw new utilsService.CustomAppError("Logged-in user email is required", 400);
        }

        const resolvedPayload = resolveInvitePayload(payload);

        const invitation = await InvitationModel.findById(resolvedPayload.invitationId);

        if (!invitation) {
            throw new utilsService.CustomAppError("Invitation not found", 404);
        }

        const invitationWorkspaceId = String(invitation.workspaceId);
        if (invitationWorkspaceId !== resolvedPayload.workspaceId) {
            throw new utilsService.CustomAppError("Invitation payload is invalid", 400);
        }

        if (normalizeEmail(invitation.email) !== normalizeEmail(resolvedPayload.email)) {
            throw new utilsService.CustomAppError("Invitation payload email does not match", 400);
        }

        if (normalizeEmail(invitation.email) !== normalizeEmail(userEmail)) {
            throw new utilsService.CustomAppError("This invitation belongs to a different email", 403);
        }

        if (invitation.status === "REJECTED") {
            throw new utilsService.CustomAppError("This invitation has been rejected", 400);
        }

        const invitationRole = toRole(String(invitation.role || resolvedPayload.role || "MEMBER"));

        const existingMembership = await WorkspaceMemberModel.findOne({
            workspaceId: invitationWorkspaceId,
            userId,
        });

        if (!existingMembership) {
            await WorkspaceMemberModel.create({
                workspaceId: invitationWorkspaceId,
                userId,
                standardRole: invitationRole,
                isActive: true,
                workspaceEmail: invitation.email,
            });
        } else if (!existingMembership.isActive) {
            existingMembership.isActive = true;
            await existingMembership.save();
        }

        if (invitation.status !== "ACCEPTED") {
            invitation.status = "ACCEPTED";
            await invitation.save();
        }

        if (session) {
            session.workspaceId = invitationWorkspaceId;
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                message: "Invitation accepted successfully",
                data: {
                    invitationId: String(invitation._id),
                    workspaceId: invitationWorkspaceId,
                    status: invitation.status,
                },
            },
        };
    },

    update: async (id: string, data: UpdateInvitation, user: any) => {
        const userId = getUserId(user);
        const updatedInvitation = await InvitationModel.findOneAndUpdate(
            { _id: id, invitedBy: userId },
            {
                $set: {
                    ...data,
                    role: data.role ? toRole(data.role) : undefined,
                },
            },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedInvitation) {
            throw new utilsService.CustomAppError("Invitation not found", 404);
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                message: "Invitation updated successfully",
                data: updatedInvitation,
            },
        };
    },

    delete: async (id: string, user: any) => {
        const userId = getUserId(user);
        const deletedInvitation = await InvitationModel.findOneAndDelete({
            _id: id,
            invitedBy: userId,
        });

        if (!deletedInvitation) {
            throw new utilsService.CustomAppError("Invitation not found", 404);
        }

        return {
            statusCode: 200,
            body: {
                success: true,
                message: `Invitation with ID '${id}' deleted successfully!`,
            },
        };
    },       
};

export default invitationService;