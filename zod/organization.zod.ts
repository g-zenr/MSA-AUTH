import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

// Color validation schema
const colorValidation = z.string().refine((color) => {
	if (!color?.trim()) return false;

	const trimmedColor = color.trim();

	// Hex color pattern
	const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
	if (hexPattern.test(trimmedColor)) return true;

	// RGB/RGBA pattern
	const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
	if (rgbPattern.test(trimmedColor)) return true;

	// Valid color names
	const colorNames = [
		"red",
		"green",
		"blue",
		"yellow",
		"orange",
		"purple",
		"pink",
		"brown",
		"black",
		"white",
		"gray",
		"grey",
		"transparent",
		"inherit",
		"initial",
		"unset",
		"currentColor",
	];

	return colorNames.includes(trimmedColor.toLowerCase());
}, "Invalid color format. Use hex (#000000), rgb(0,0,0), rgba(0,0,0,1), or valid color names");

export const ColorsSchema = z.object({
	primary: colorValidation.optional(),
	secondary: colorValidation.optional(),
	accent: colorValidation.optional(),
	success: colorValidation.optional(),
	warning: colorValidation.optional(),
	danger: colorValidation.optional(),
	info: colorValidation.optional(),
	light: colorValidation.optional(),
	dark: colorValidation.optional(),
	neutral: colorValidation.optional(),
});

export const BrandingSchema = z.object({
	logo: z.string().url("Invalid logo URL").optional(),
	background: z.string().url("Invalid background URL").optional(),
	font: z.string().max(100, "Font must be at most 100 characters").optional(),
	colors: ColorsSchema.optional(),
});

export const PurchasedModuleSchema = z.object({
	moduleId: ObjectIdSchema.optional(),
	purchaseDate: z
		.date()
		.optional()
		.default(() => new Date()),
	licenseStartDate: z
		.date()
		.optional()
		.default(() => new Date()),
	licenseEndDate: z.date().optional(),
	isActive: z.boolean().optional().default(true),
});

export const PurchasedAppSchema = z.object({
	appId: ObjectIdSchema.optional(),
	modules: z.array(PurchasedModuleSchema).optional().default([]),
	purchaseDate: z
		.date()
		.optional()
		.default(() => new Date()),
	licenseStartDate: z
		.date()
		.optional()
		.default(() => new Date()),
	licenseEndDate: z.date().optional(),
	isActive: z.boolean().optional().default(true),
});

export const IntegrationConfigSchema = z.object({
	integrationId: ObjectIdSchema,
	configuration: z.record(z.any()), // JSON object
	isActive: z.boolean().optional().default(true),
});

export const CreateOrganizationSchema = z.object({
	name: z
		.string()
		.min(1, "Organization name is required")
		.max(255, "Name must be at most 255 characters"),
	description: z
		.string()
		.min(1, "Organization description is required")
		.max(1000, "Description must be at most 1000 characters"),
	code: z
		.string()
		.min(1, "Organization code is required")
		.max(50, "Code must be at most 50 characters"),
	branding: BrandingSchema.optional(),
	integrations: z.array(IntegrationConfigSchema).optional().default([]),
	apps: z.array(PurchasedAppSchema).optional().default([]),
	// Form data fields for branding
	font: z.string().max(100, "Font must be at most 100 characters").optional(),
	primaryColor: colorValidation.optional(),
	secondaryColor: colorValidation.optional(),
	accentColor: colorValidation.optional(),
	successColor: colorValidation.optional(),
	warningColor: colorValidation.optional(),
	dangerColor: colorValidation.optional(),
	infoColor: colorValidation.optional(),
	lightColor: colorValidation.optional(),
	darkColor: colorValidation.optional(),
	neutralColor: colorValidation.optional(),
	// This field is used for Cloudinary organization but not stored in DB
	path: z.string().optional(),
});

export const UpdateOrganizationSchema = z.object({
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
	code: z
		.string()
		.min(1, "Code must be a non-empty string")
		.max(50, "Code must be at most 50 characters")
		.optional(),
	branding: BrandingSchema.optional(),
	integrations: z.array(IntegrationConfigSchema).optional(),
	apps: z.array(PurchasedAppSchema).optional(),
	// Form data fields for branding
	font: z.string().max(100, "Font must be at most 100 characters").optional(),
	primaryColor: colorValidation.optional(),
	secondaryColor: colorValidation.optional(),
	accentColor: colorValidation.optional(),
	successColor: colorValidation.optional(),
	warningColor: colorValidation.optional(),
	dangerColor: colorValidation.optional(),
	infoColor: colorValidation.optional(),
	lightColor: colorValidation.optional(),
	darkColor: colorValidation.optional(),
	neutralColor: colorValidation.optional(),
	// This field is used for Cloudinary organization but not stored in DB
	path: z.string().optional(),
});

export const OrganizationQuerySchema = z.object({
	page: z.number().int().positive().optional().default(1),
	limit: z.number().int().positive().max(100).optional().default(10),
	search: z.string().optional(),
	sortBy: z.enum(["name", "code", "createdAt", "updatedAt"]).optional().default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type Colors = z.infer<typeof ColorsSchema>;
export type Branding = z.infer<typeof BrandingSchema>;
export type PurchasedModule = z.infer<typeof PurchasedModuleSchema>;
export type PurchasedApp = z.infer<typeof PurchasedAppSchema>;
export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type OrganizationQuery = z.infer<typeof OrganizationQuerySchema>;
