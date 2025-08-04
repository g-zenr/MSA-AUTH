import { z } from "zod";
import { MaintenanceStatus } from "../generated/prisma";

// ObjectId validation schema
export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
	message: "Invalid ObjectId format",
});

// Create Maintenance Record Schema
export const CreateMaintenanceSchema = z
	.object({
		date: z.coerce.date({
			required_error: "Date is required",
			invalid_type_error: "Date must be a valid date",
		}),
		description: z
			.string()
			.min(1, "Description is required")
			.max(1000, "Description is too long"),
		cost: z.number().positive("Cost must be a positive number").optional(),
		facilityId: ObjectIdSchema,
		maintainedById: ObjectIdSchema,
		startDate: z.coerce.date().optional(),
		endDate: z.coerce.date().optional(),
		status: z.nativeEnum(MaintenanceStatus).default(MaintenanceStatus.PENDING),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate;
			}
			return true;
		},
		{
			message: "End date cannot be before start date",
			path: ["endDate"],
		},
	);

// Update Maintenance Record Schema
export const UpdateMaintenanceSchema = z
	.object({
		date: z.coerce.date().optional(),
		description: z
			.string()
			.min(1, "Description cannot be empty")
			.max(1000, "Description is too long")
			.optional(),
		cost: z.number().positive("Cost must be a positive number").optional(),
		facilityId: ObjectIdSchema.optional(),
		maintainedById: ObjectIdSchema.optional(),
		startDate: z.coerce.date().optional(),
		endDate: z.coerce.date().optional(),
		status: z.nativeEnum(MaintenanceStatus).optional(),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate;
			}
			return true;
		},
		{
			message: "End date cannot be before start date",
			path: ["endDate"],
		},
	);

// Query parameters schema
export const MaintenanceQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
	sort: z.string().optional(),
	order: z.enum(["asc", "desc"]).default("desc"),
	fields: z.string().optional(),
	query: z.string().optional(),
	filter: z.string().optional(),
	status: z.nativeEnum(MaintenanceStatus).optional(),
	facilityId: ObjectIdSchema.optional(),
	maintainedById: ObjectIdSchema.optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
});

// Types
export type CreateMaintenanceInput = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof UpdateMaintenanceSchema>;
export type MaintenanceQueryParams = z.infer<typeof MaintenanceQuerySchema>;
