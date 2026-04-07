import { z } from "zod";

export const createInvitationSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "member"], "Role must be either 'admin' or 'member'"),
});

export type CreateInvitation = z.infer<typeof createInvitationSchema>;

export const updateInvitationSchema = z.object({
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["admin", "member"], "Role must be either 'admin' or 'member'").optional(),
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED"], "Status must be 'PENDING', 'ACCEPTED', or 'REJECTED'").optional(),
});

export type UpdateInvitation = z.infer<typeof updateInvitationSchema>;

export const acceptInvitationSchema = z
    .object({
        inviteToken: z.string().min(1).optional(),
        invitationId: z.string().min(1).optional(),
        workspaceId: z.string().min(1).optional(),
        email: z.string().email("Invalid email address").optional(),
        role: z.string().optional(),
    })
    .refine(
        (payload) => {
            if (payload.inviteToken) return true;
            return Boolean(payload.invitationId && payload.workspaceId && payload.email);
        },
        {
            message: "inviteToken or invitationId/workspaceId/email is required",
        }
    );

export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;
