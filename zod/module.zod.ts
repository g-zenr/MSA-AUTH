import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const CreateModuleSchema = z.object({
	name: z
		.string()
		.min(1, "Module name is required")
		.max(255, "Name must be at most 255 characters"),
	description: z
		.string()
		.min(1, "Module description is required")
		.max(1000, "Description must be at most 1000 characters"),
	icon: z.string().max(255, "Icon must be at most 255 characters").optional(),
	code: z
		.string()
		.min(1, "Module code is required")
		.max(50, "Code must be at most 50 characters"),
	type: z
		.string()
		.min(1, "Module type is required")
		.max(100, "Type must be at most 100 characters"),
	appId: ObjectIdSchema,
});

export const UpdateModuleSchema = z.object({
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
	type: z
		.string()
		.min(1, "Type must be a non-empty string")
		.max(100, "Type must be at most 100 characters")
		.optional(),
	appId: ObjectIdSchema.optional(),
});

export const ModuleQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1),
	limit: z.number().int().positive().max(100).optional().default(10),
	search: z.string().optional(),
	appId: ObjectIdSchema.optional(),
	type: z.string().optional(),
	sortBy: z
		.enum(["name", "code", "type", "createdAt", "updatedAt"])
		.optional()
		.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;
export type UpdateModuleInput = z.infer<typeof UpdateModuleSchema>;
export type ModuleQuery = z.infer<typeof ModuleQuerySchema>;
