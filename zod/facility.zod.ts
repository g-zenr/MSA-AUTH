import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

// Note: Location is now a relation to the Location model via locationId
// The embedded LocationSchema has been removed in favor of using the Location model relation

export const DailyTimeSchema = z.object({
	openTime: z.string().optional(),
	closeTime: z.string().optional(),
});

export const OperatingHoursSchema = z.object({
	monday: DailyTimeSchema,
	tuesday: DailyTimeSchema,
	wednesday: DailyTimeSchema,
	thursday: DailyTimeSchema,
	friday: DailyTimeSchema,
	saturday: DailyTimeSchema,
	sunday: DailyTimeSchema,
});

// Schema for bulk room creation
export const BulkRoomCreationSchema = z
	.object({
		roomStart: z.number().int().positive("Room start must be a positive integer"),
		roomEnd: z.number().int().positive("Room end must be a positive integer"),
	})
	.refine((data) => data.roomEnd >= data.roomStart, {
		message: "Room end must be greater than or equal to room start",
	});

export const CreateFacilitySchema = z.object({
	name: z
		.string()
		.min(1, "Facility name is required")
		.max(255, "Facility name must be at most 255 characters"),
	facilityTypeId: ObjectIdSchema.optional(),
	description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
	facilityLocationId: ObjectIdSchema.optional(),
	organizationId: ObjectIdSchema,
	metadata: z.record(z.any()).optional(),
	isTimeBased: z.boolean().optional().default(false),
	operatingHours: OperatingHoursSchema.optional(),
	// Bulk creation fields - optional
	bulkCreate: BulkRoomCreationSchema.optional(),
});

export const UpdateFacilitySchema = z.object({
	name: z
		.string()
		.min(1, "Facility name is required")
		.max(255, "Facility name must be at most 255 characters")
		.optional(),
	facilityTypeId: ObjectIdSchema.optional(),
	description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
	facilityLocationId: ObjectIdSchema.optional(),
	organizationId: ObjectIdSchema.optional(),
	metadata: z.record(z.any()).optional(),
	isTimeBased: z.boolean().optional(),
	operatingHours: OperatingHoursSchema.optional(),
});

export const FacilityQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1),
	limit: z.number().int().positive().max(100).optional().default(10),
	search: z.string().optional(),
	facilityTypeId: ObjectIdSchema.optional(),
	organizationId: ObjectIdSchema.optional(),
	sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional().default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateFacilityInput = z.infer<typeof CreateFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof UpdateFacilitySchema>;
export type FacilityQuery = z.infer<typeof FacilityQuerySchema>;
// Location type removed - use Location model directly from Prisma
