import { z } from "zod";

export const facilityLocationSchema = z.object({
	building: z.string().optional(),
	floor: z.string().optional(),
	nearby: z.string().optional(),
	notes: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});

export const updateFacilityLocationSchema = facilityLocationSchema.partial();
