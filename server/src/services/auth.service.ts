import bcrypt from "bcryptjs";

import UserModel from "../models/user.model";
import LoginHistory from "../models/loginHistory.model";
import utilsService from "./utils.service";
import curdService from "./crud.service";

import type {
	RegisterServicePayload,
	LoginServicePayload,
	MeServicePayload,
	LogoutServicePayload
} from "../validators/auth.validator";


type SanitizedUser = {
	_id: string;
	username: string;
	email: string;
};

type UserWithPassword = {
	_id: unknown;
	username: string;
	email: string;
	password: string;
};

type UserPublic = {
	_id: unknown;
	username: string;
	email: string;
};

type RegisterCreateData = Omit<RegisterServicePayload, "session">;

const sanitizeUser = (user: {
	_id: unknown;
	username: string;
	email: string;
}): SanitizedUser => ({
	_id: String(user._id),
	username: user.username,
	email: user.email
});

const userCrud = curdService(UserModel);

const persistSession = async (session: any) => {
	await new Promise<void>((resolve, reject) => {
		session.save((err: unknown) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
};

const authService = {

	/* ================= REGISTER ================= */

	async register(payload: RegisterServicePayload) {
		const { session, ...registerData } = payload;

		const created = await userCrud.createOne({
			data: registerData,
			hooks: {
				beforeCreate: async (data: RegisterCreateData) => {
					const { email, password, username } = data;
					if (!email || !password || !username) {
						throw new utilsService.CustomAppError(
							"email, username and password are required",
							400
						);
					}

					const existingUsers = await userCrud.getAll({
						filter: {
							$or: [
								{ email },
								{ username }
							]
						},
						queryString: {}
					});

					if (existingUsers.data.length > 0) {
						throw new utilsService.CustomAppError(
							"Email or username already in use",
							400
						);
					}

					const hashedPassword = await bcrypt.hash(password, 10);
					return {
						...data,
						password: hashedPassword
					};
				},
			}
		});

		const createdUser = created.data as UserPublic;

		session.userId = String(createdUser._id);
		await persistSession(session);

		return {
			statusCode: 201,
			body: {
				success: true,
				message: "Registered successfully",
				data: sanitizeUser(createdUser)
			}
		};
	},


	/* ================= LOGIN ================= */

	async login(payload: LoginServicePayload) {

		const { email, password, session, sessionID, ip, userAgent } = payload;

		if (!email || !password) {
			throw new utilsService.CustomAppError(
				"email and password are required",
				400
			);
		}

		const users = await userCrud.getAll({
			filter: { email },
			queryString: {}
		});

		const user = users.data[0] as UserWithPassword | undefined;

		if (!user) {
			throw new utilsService.CustomAppError("Invalid credentials", 401);
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {

			await LoginHistory.create({
				user: String(user._id),
				sessionId: sessionID,
				ipAddress: ip || null,
				userAgent: userAgent || null,
				loginStatus: "FAILED"
			});

			throw new utilsService.CustomAppError("Invalid credentials", 401);
		}

		session.userId = String(user._id);
		await persistSession(session);

		await LoginHistory.create({
			user: String(user._id),
			sessionId: sessionID,
			ipAddress: ip || null,
			userAgent: userAgent || null,
			loginStatus: "SUCCESS"
		});

		return {
			statusCode: 200,
			body: {
				success: true,
				message: "Logged in successfully",
				data: sanitizeUser(user)
			}
		};
	},


	/* ================= CURRENT USER ================= */

	async me(user: any, workspace: any) {
		const resolvedUserId = user?.userId || user?._id;

		if (!resolvedUserId) {
			throw new utilsService.CustomAppError("Unauthorized: User not found", 401);
		}

		const userResult = await userCrud.getOne({
			id: String(resolvedUserId),
		});

		const userInfo = userResult.data as unknown as UserPublic;

		return {
			statusCode: 200,
			body: {
				success: true,
				message: "Current user fetched",
				data: {
					user: sanitizeUser(userInfo),
					workspace: workspace || null
				}
			}
		};
	},


	/* ================= LOGOUT ================= */

	async logout(payload: LogoutServicePayload) {

		const { session, sessionID, clearCookie } = payload;

		const userId = session?.userId;

		if (!userId) {

			clearCookie();

			return {
				statusCode: 200,
				body: {
					success: true,
					message: "Logged out"
				}
			};
		}

		await LoginHistory.findOneAndUpdate(
			{
				user: userId,
				sessionId: sessionID,
				logoutTime: { $exists: false }
			},
			{
				logoutTime: new Date()
			},
			{
				sort: { createdAt: -1 }
			}
		);

		await new Promise<void>((resolve, reject) => {

			session.destroy((err: any) => {

				if (err) {
					reject(err);
					return;
				}

				resolve();
			});

		});

		clearCookie();

		return {
			statusCode: 200,
			body: {
				success: true,
				message: "Logged out successfully"
			}
		};
	}

};

export default authService;