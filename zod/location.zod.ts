import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const CreateLocationSchema = z.object({
	name: z.string().min(1, "Name is required"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	province: z.string().min(1, "Province is required"),
	postalCode: z.string().min(1, "Postal code is required"),
	country: z.string().min(1, "Country is required"),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	landmark: z.string().optional(),
	timezone: z.string().optional(),
	metadata: z.any().optional(),
});

export const UpdateLocationSchema = z.object({
	name: z.string().min(1, "Name is required").optional(),
	address: z.string().min(1, "Address is required").optional(),
	city: z.string().min(1, "City is required").optional(),
	province: z.string().min(1, "Province is required").optional(),
	postalCode: z.string().min(1, "Postal code is required").optional(),
	country: z.string().min(1, "Country is required").optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	landmark: z.string().optional(),
	timezone: z.string().optional(),
	metadata: z.any().optional(),
});

export type CreateLocationSchemaType = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationSchemaType = z.infer<typeof UpdateLocationSchema>;
