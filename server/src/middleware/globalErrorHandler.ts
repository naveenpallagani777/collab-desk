import type { NextFunction, Request, Response } from "express";

import utilsService from "../services/utils.service";
import { logError } from "../helpers/logger";

type AppErrorLike = Error & {
    statusCode?: number;
    data?: Record<string, unknown>;
};

const globalErrorHandler = (
    err: AppErrorLike,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    logError(err, {
        path: _req.originalUrl,
        method: _req.method,
    });

    if (err instanceof utilsService.CustomAppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.data ? { data: err.data } : {}),
        });
    }

    return res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
};

export default globalErrorHandler;
