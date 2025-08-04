import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const CreateRateTypeSchema = z.object({
	name: z
		.string()
		.min(1, "Rate type name is required")
		.max(255, "Name must be at most 255 characters"),
	code: z.string().max(50, "Code must be at most 50 characters").optional(),
	description: z.string().max(500, "Description must be at most 500 characters").optional(),
	organizationId: ObjectIdSchema,
	defaultTax: z
		.number()
		.min(0, "Default tax must be a positive number")
		.max(100, "Default tax cannot exceed 100%")
		.optional(),
	defaultDiscount: z
		.number()
		.min(0, "Default discount must be a positive number")
		.max(100, "Default discount cannot exceed 100%")
		.optional(),
	isDeleted: z.boolean().optional().default(false),
});

export const UpdateRateTypeSchema = z.object({
	name: z
		.string()
		.min(1, "Name must be a non-empty string")
		.max(255, "Name must be at most 255 characters")
		.optional(),
	code: z.string().max(50, "Code must be at most 50 characters").optional(),
	description: z.string().max(500, "Description must be at most 500 characters").optional(),
	organizationId: ObjectIdSchema.optional(),
	defaultTax: z
		.number()
		.min(0, "Default tax must be a positive number")
		.max(100, "Default tax cannot exceed 100%")
		.optional(),
	defaultDiscount: z
		.number()
		.min(0, "Default discount must be a positive number")
		.max(100, "Default discount cannot exceed 100%")
		.optional(),
	isDeleted: z.boolean().optional(),
});

export const RateTypeQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1),
	limit: z.number().int().positive().max(100).optional().default(10),
	search: z.string().optional(),
	sortBy: z
		.enum([
			"name",
			"code",
			"description",
			"defaultTax",
			"defaultDiscount",
			"createdAt",
			"updatedAt",
		])
		.optional()
		.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
	organizationId: ObjectIdSchema.optional(),
});

export type CreateRateTypeInput = z.infer<typeof CreateRateTypeSchema>;
export type UpdateRateTypeInput = z.infer<typeof UpdateRateTypeSchema>;
export type RateTypeQuery = z.infer<typeof RateTypeQuerySchema>;
