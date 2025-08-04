import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";

import { PrismaClient } from "./generated/prisma";
import { config } from "./config/config";

import verifyToken from "./middleware/verifyToken";
import { connectDb } from "./config/database";

process.setMaxListeners(50);

const app = express();
const prisma = new PrismaClient();

const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: config.cors.origins,
		credentials: config.cors.credentials,
	},
});

app.use((req: Request, res: Response, next: NextFunction) => {
	(req as any).io = io;
	next();
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || "development",
	});
});

const auth = require("./app/auth")(prisma);
const user = require("./app/user")(prisma);
const person = require("./app/person")(prisma);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS
app.use(
	cors({
		origin: config.cors.origins,
		credentials: config.cors.credentials,
	}),
);

// Set up routes that don't need authentication
app.use(config.baseApiPath, auth);

// Apply middleware for protected routes, excluding /docs and /auth
app.use(config.baseApiPath, (req: Request, res: Response, next: NextFunction) => {
	if (
		req.path.startsWith("/docs") ||
		req.path.startsWith("/ttlock/callback") ||
		req.path.startsWith("/ttlock/ic-card/add") ||
		req.path.startsWith("/ttlock/lock/all/public")
	) {
		// Skip middleware for the docs, auth, and add IC card routes
		return next();
	}
	verifyToken(req, res, () => {
		next();
	});
});

app.use(config.baseApiPath, user);
app.use(config.baseApiPath, person);

server.listen(config.port, async () => {
	await connectDb();
	console.log(`Server is running on port ${config.port}`);
});
