import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(1, "Username is required").trim(),
    email: z.string().email("Invalid email address").trim(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address").trim(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type RegisterRequestBody = z.infer<typeof registerSchema>;
export type LoginRequestBody = z.infer<typeof loginSchema>;

export type RegisterServicePayload = RegisterRequestBody & {
    session: any;
};

export type LoginServicePayload = LoginRequestBody & {
    session: any;
    sessionID: string;
    ip?: string | undefined;
    userAgent?: string | undefined;
};

export type MeServicePayload = {
    session: any;
};

export type LogoutServicePayload = {
    session: any;
    sessionID: string;
    clearCookie: () => void;
};