import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    ownerId: z.string().min(1, "Owner ID is required"),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    location: z.object({
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
        coordinates: z.object({
            lat: z.number().optional(),
            lng: z.number().optional(),
        }).optional(),
        timezone: z.string().optional(),
    }).optional(),
});

export const updateWorkspaceSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    location: z.object({
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
        coordinates: z.object({
            lat: z.number().optional(),
            lng: z.number().optional(),
        }).optional(),
        timezone: z.string().optional(),
    }).optional(),
});

export type CreateWorkspace = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspace = z.infer<typeof updateWorkspaceSchema>;