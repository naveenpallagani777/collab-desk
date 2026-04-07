import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo"
import cors from "cors";

import config from "./config";
import router from "./routes/index.route";
import utilsService from "./services/utils.service";
import globalErrorHandler from "./middleware/globalErrorHandler";
import logger, { requestLogger, logError } from "./helpers/logger";

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: config.cors.headers,
    credentials: config.cors.credentials,
}));

app.use(session({
    name: 'collab-desk-session',
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: config.mongoDB.mongoURI,
        collectionName: 'sessions',
    }),
    cookie: { 
        httpOnly: true,
        sameSite: 'lax',
        secure: false, 
        maxAge: 1000 * 60 * 60 * 24 
    } // 1 day
}));

app.get("/api", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Collab Desk API!" 
    });
});

app.use("/api", router);

app.use((req, _res, next) => {
    next(new utilsService.CustomAppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

mongoose.connect(config.mongoDB.mongoURI)
    .then(() => {
        logger.info("Connected to MongoDB");
        app.listen(config.port, () => {
            logger.info(`Server running on port http://localhost:${config.port}/api`);
        });
    })
    .catch((error) => {
        logError(error, { source: "mongodb.connect" });
    });