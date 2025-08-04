import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const CreateIntegrationSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
	description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
	provider: z
		.string()
		.min(1, "Provider is required")
		.max(255, "Provider must be at most 255 characters"),
});

export const UpdateIntegrationSchema = z.object({
	name: z
		.string()
		.min(1, "Name must be a non-empty string")
		.max(255, "Name must be at most 255 characters")
		.optional(),
	description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
	provider: z
		.string()
		.min(1, "Provider must be a non-empty string")
		.max(255, "Provider must be at most 255 characters")
		.optional(),
});

export const IntegrationResponseSchema = z.object({
	id: ObjectIdSchema,
	name: z.string(),
	description: z.string().nullable(),
	provider: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const IntegrationQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1),
	limit: z.number().int().positive().max(100).optional().default(10),
	search: z.string().optional(),
	provider: z.string().optional(),
	sortBy: z.enum(["name", "provider", "createdAt", "updatedAt"]).optional().default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateIntegrationInput = z.infer<typeof CreateIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof UpdateIntegrationSchema>;
export type IntegrationResponse = z.infer<typeof IntegrationResponseSchema>;
export type IntegrationQuery = z.infer<typeof IntegrationQuerySchema>;
