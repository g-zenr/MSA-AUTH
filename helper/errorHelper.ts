import { Response } from "express";

export const handleError = (error: unknown, res: Response): void => {
	if (error instanceof Error) {
		if (error.name === "ValidationError") {
			res.status(400).json({ error: error.message });
		} else if (error.name === "UnauthorizedError") {
			res.status(401).json({ error: error.message });
		} else {
			res.status(500).json({ error: error.message });
		}
	}
};
