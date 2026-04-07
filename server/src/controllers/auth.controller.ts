import type { Request, Response } from "express";

import authService from "../services/auth.service";
import catchAsync from "../helpers/catchAsync";

import {
	registerSchema,
	loginSchema
} from "../validators/auth.validator";

import type {
	RegisterRequestBody,
	LoginRequestBody
} from "../validators/auth.validator";


const authController = {
	register: catchAsync(async (req: Request, res: Response) => {

		const body = registerSchema.parse(req.body);

		const result = await authService.register({
			...body,
			session: req.session
		});

		return res.status(result.statusCode).json(result.body);
	}),

	login: catchAsync(async (req: Request, res: Response) => {

		const body = req.body as LoginRequestBody;

		const result = await authService.login({
			...body,
			session: req.session,
			sessionID: req.sessionID,
			ip: req.ip,
			userAgent: req.get("user-agent") || undefined
		});

		return res.status(result.statusCode).json(result.body);
	}),

	me: catchAsync(async (req: Request, res: Response) => {

		const result = await authService.me(req.user, req.workspace);

		return res.status(result.statusCode).json(result.body);
	}),

	logout: catchAsync(async (req: Request, res: Response) => {

		const result = await authService.logout({
			session: req.session,
			sessionID: req.sessionID,
			clearCookie: () =>
				res.clearCookie("collab-desk-session", {
					httpOnly: true,
					sameSite: "lax",
					secure: false,
					path: "/"
				})
		});

		return res.status(result.statusCode).json(result.body);
	}),

};

export default authController;