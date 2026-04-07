import type { NextFunction, Request, Response } from "express";
import pino from "pino";

const logger = pino({
	name: "collab-desk-server",
	level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
	timestamp: pino.stdTimeFunctions.isoTime,
	redact: {
		paths: [
			"req.headers.authorization",
			"req.body.password",
			"req.body.token",
			"password",
			"token",
		],
		censor: "[REDACTED]",
	},
});

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const start = process.hrtime.bigint();

	res.on("finish", () => {
		const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
		logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${durationMs.toFixed(2)} ms`);
	});

	next();
};

export const logError = (error: unknown, context?: Record<string, unknown>) => {
	logger.error(
		{
			err: error,
			...(context ? { context } : {}),
		},
		"Application error"
	);
};

export default logger;
