import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const CreateAppSchema = z.object({
	name: z.string().min(1, "App name is required").max(255, "Name must be at most 255 characters"),
	description: z
		.string()
		.min(1, "App description is required")
		.max(1000, "Description must be at most 1000 characters"),
	icon: z.string().max(255, "Icon must be at most 255 characters").optional(),
	code: z.string().min(1, "App code is required").max(50, "Code must be at most 50 characters"),
});

export const UpdateAppSchema = z.object({
	name: z
		.string()
		.min(1, "Name must be a non-empty string")
		.max(255, "Name must be at most 255 characters")
		.optional(),
	description: z
		.string()
		.min(1, "Description must be a non-empty string")
		.max(1000, "Description must be at most 1000 characters")
		.optional(),
	icon: z.string().max(255, "Icon must be at most 255 characters").optional(),
	code: z
		.string()
		.min(1, "Code must be a non-empty string")
		.max(50, "Code must be at most 50 characters")
		.optional(),
});

export const AppQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1),
	limit: z.number().int().positive().max(100).optional().default(10),
	search: z.string().optional(),
	organizationId: ObjectIdSchema.optional(),
	sortBy: z
		.enum(["name", "code", "description", "createdAt", "updatedAt"])
		.optional()
		.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateAppInput = z.infer<typeof CreateAppSchema>;
export type UpdateAppInput = z.infer<typeof UpdateAppSchema>;
export type AppQuery = z.infer<typeof AppQuerySchema>;
