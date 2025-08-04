import { z } from "zod";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

// Facility Category enum
export const FacilityCategorySchema = z.enum([
	"HOTEL",
	"GYM",
	"RESTAURANT",
	"SPORTS_COURT",
	"CONFERENCE_ROOM",
	"PARKING",
	"AMENITY_SPACE",
	"OTHER",
]);

export const BedTypeSchema = z.enum([
	"SINGLE_BED",
	"DOUBLE_BED",
	"QUEEN_BED",
	"KING_BED",
	"TWIN_BED",
	"BUNK_BED",
	"SOFA_BED",
	"MURPHY_BED",
	"DAYBED",
	"FUTON",
]);

export const RoomFeatureSchema = z.enum([
	"AIR_CONDITIONING",
	"HEATING",
	"WIFI",
	"TELEVISION",
	"MINIBAR",
	"SAFE",
	"BALCONY",
	"TERRACE",
	"KITCHEN",
	"KITCHENETTE",
	"BATHROOM",
	"PRIVATE_BATHROOM",
	"SHARED_BATHROOM",
	"JACUZZI",
	"BATHTUB",
	"SHOWER",
	"HAIR_DRYER",
	"TOWELS",
	"LINENS",
	"IRON",
	"IRONING_BOARD",
	"CLOSET",
	"WARDROBE",
	"WORK_DESK",
	"SEATING_AREA",
	"DINING_AREA",
	"FIREPLACE",
	"OCEAN_VIEW",
	"MOUNTAIN_VIEW",
	"GARDEN_VIEW",
	"CITY_VIEW",
	"POOL_VIEW",
	"PARKING",
	"PET_FRIENDLY",
	"SMOKING_ALLOWED",
	"NON_SMOKING",
	"WHEELCHAIR_ACCESSIBLE",
	"ELEVATOR_ACCESS",
	"SOUNDPROOF",
	"BLACKOUT_CURTAINS",
]);

export const AmenitySchema = z.enum([
	"CONCIERGE_SERVICE",
	"ROOM_SERVICE",
	"LAUNDRY_SERVICE",
	"DRY_CLEANING",
	"VALET_PARKING",
	"BUSINESS_CENTER",
	"FITNESS_CENTER",
	"SWIMMING_POOL",
	"HOT_TUB",
	"SAUNA",
	"STEAM_ROOM",
	"SPA_SERVICES",
	"MASSAGE_SERVICES",
	"RESTAURANT",
	"BAR_LOUNGE",
	"COFFEE_SHOP",
	"GIFT_SHOP",
	"CONFERENCE_FACILITIES",
	"MEETING_ROOMS",
	"BANQUET_HALLS",
	"WEDDING_SERVICES",
	"CHILDCARE_SERVICES",
	"PET_SERVICES",
	"AIRPORT_SHUTTLE",
	"CAR_RENTAL",
	"TOUR_DESK",
	"CURRENCY_EXCHANGE",
	"ATM",
	"LUGGAGE_STORAGE",
	"WAKE_UP_CALL",
	"NEWSPAPER_DELIVERY",
	"COMPLIMENTARY_BREAKFAST",
	"HAPPY_HOUR",
	"LIBRARY",
	"GAME_ROOM",
	"TENNIS_COURT",
	"GOLF_COURSE",
	"BEACH_ACCESS",
	"SKI_ACCESS",
	"HIKING_TRAILS",
	"BICYCLE_RENTAL",
]);

// Polymorphic metadata schemas for each facility category
export const HotelMetadataSchema = z.object({
	bedType: BedTypeSchema,
	bedCount: z.number().int().min(1, "Bed count must be a positive number"),
	maxOccupancy: z.number().int().min(1, "Max occupancy must be a positive number"),
	amenities: z.array(AmenitySchema).optional().default([]),
	roomFeatures: z.array(RoomFeatureSchema).optional().default([]),
});

export const GymMetadataSchema = z.object({
	equipment: z.array(z.string()).optional().default([]),
	hasTrainer: z.boolean().optional().default(false),
	openingHours: z.string().optional(),
	capacity: z.number().int().min(1).optional(),
	specialtyArea: z.string().optional(), // e.g., "Cardio", "Weights", "Yoga"
});

export const RestaurantMetadataSchema = z.object({
	cuisineType: z.string().optional(),
	seatingCapacity: z.number().int().min(1).optional(),
	hasDelivery: z.boolean().optional().default(false),
	hasTakeout: z.boolean().optional().default(false),
	openingHours: z.string().optional(),
	menuUrl: z.string().url().optional(),
	avgMealPrice: z.number().min(0).optional(),
});

export const SportsCourtMetadataSchema = z.object({
	sportType: z.string(), // e.g., "Tennis", "Basketball", "Volleyball"
	surfaceType: z.string().optional(), // e.g., "Clay", "Hardcourt", "Grass"
	isIndoor: z.boolean().optional().default(false),
	maxPlayers: z.number().int().min(1).optional(),
	equipmentProvided: z.array(z.string()).optional().default([]),
	openingHours: z.string().optional(),
});

export const ConferenceRoomMetadataSchema = z.object({
	seatingCapacity: z.number().int().min(1),
	hasProjector: z.boolean().optional().default(false),
	hasWhiteboard: z.boolean().optional().default(false),
	hasVideoConferencing: z.boolean().optional().default(false),
	hasAudioSystem: z.boolean().optional().default(false),
	layout: z.string().optional(), // e.g., "Theater", "Classroom", "U-Shape"
	equipment: z.array(z.string()).optional().default([]),
});

export const ParkingMetadataSchema = z.object({
	vehicleType: z.string().optional(), // e.g., "Car", "Motorcycle", "Truck"
	isUnderground: z.boolean().optional().default(false),
	isCovered: z.boolean().optional().default(false),
	hasElectricCharging: z.boolean().optional().default(false),
	maxVehicleHeight: z.number().optional(), // in meters
	securityLevel: z.string().optional(), // e.g., "Basic", "Monitored", "Gated"
});

export const AmenitySpaceMetadataSchema = z.object({
	amenityType: z.string(), // e.g., "Pool", "Spa", "Library", "Garden"
	capacity: z.number().int().min(1).optional(),
	requiresReservation: z.boolean().optional().default(false),
	openingHours: z.string().optional(),
	ageRestriction: z.string().optional(), // e.g., "Adults Only", "All Ages", "18+"
	additionalFees: z.number().min(0).optional(),
});

export const OtherMetadataSchema = z.object({
	customType: z.string(),
	description: z.string().optional(),
	features: z.array(z.string()).optional().default([]),
	requirements: z.array(z.string()).optional().default([]),
	capacity: z.number().int().min(1).optional(),
	openingHours: z.string().optional(),
});

// Discriminated union for type metadata validation
export const TypeMetadataSchema = z.discriminatedUnion("category", [
	z.object({ category: z.literal("HOTEL"), metadata: HotelMetadataSchema }),
	z.object({ category: z.literal("GYM"), metadata: GymMetadataSchema }),
	z.object({ category: z.literal("RESTAURANT"), metadata: RestaurantMetadataSchema }),
	z.object({ category: z.literal("SPORTS_COURT"), metadata: SportsCourtMetadataSchema }),
	z.object({ category: z.literal("CONFERENCE_ROOM"), metadata: ConferenceRoomMetadataSchema }),
	z.object({ category: z.literal("PARKING"), metadata: ParkingMetadataSchema }),
	z.object({ category: z.literal("AMENITY_SPACE"), metadata: AmenitySpaceMetadataSchema }),
	z.object({ category: z.literal("OTHER"), metadata: OtherMetadataSchema }),
]);

// Preprocessing schema to handle form data transformations
const preprocessFacilityTypeData = z.preprocess(
	(data: any) => {
		console.log("🚀 Starting preprocessing with raw data:", JSON.stringify(data, null, 2));

		if (!data || typeof data !== "object") {
			console.log("❌ Data is null, undefined, or not an object");
			return data;
		}

		const processed = { ...data };
		console.log("📋 Initial processed data:", JSON.stringify(processed, null, 2));

		// Convert string numbers to actual numbers for form data
		if (processed.price !== undefined && typeof processed.price === "string") {
			const parsedPrice = parseFloat(processed.price);
			if (!isNaN(parsedPrice)) {
				processed.price = parsedPrice;
			}
		}

		// Handle metadata if it's a string (from form data)
		if (processed.metadata && typeof processed.metadata === "string") {
			try {
				console.log("🔧 Parsing metadata string:", processed.metadata);
				processed.metadata = JSON.parse(processed.metadata);
				console.log("✅ Successfully parsed metadata:", processed.metadata);
			} catch (error) {
				console.error("❌ Failed to parse metadata:", error);
				processed.metadata = {};
			}
		}

		// Handle legacy fields for backward compatibility
		if (processed.maxOccupancy !== undefined && typeof processed.maxOccupancy === "string") {
			const parsedMaxOccupancy = parseInt(processed.maxOccupancy, 10);
			if (!isNaN(parsedMaxOccupancy)) {
				processed.maxOccupancy = parsedMaxOccupancy;
			}
		}
		if (processed.bedCount !== undefined && typeof processed.bedCount === "string") {
			const parsedBedCount = parseInt(processed.bedCount, 10);
			if (!isNaN(parsedBedCount)) {
				processed.bedCount = parsedBedCount;
			}
		}

		// Handle array fields
		if (processed.amenities && typeof processed.amenities === "string") {
			try {
				processed.amenities = JSON.parse(processed.amenities);
			} catch {
				processed.amenities = processed.amenities
					.split(",")
					.map((item: string) => item.trim())
					.filter((item: string) => item);
			}
		}
		if (processed.roomFeatures && typeof processed.roomFeatures === "string") {
			try {
				processed.roomFeatures = JSON.parse(processed.roomFeatures);
			} catch {
				processed.roomFeatures = processed.roomFeatures
					.split(",")
					.map((item: string) => item.trim())
					.filter((item: string) => item);
			}
		}
		if (processed.imageUrl && typeof processed.imageUrl === "string") {
			try {
				processed.imageUrl = JSON.parse(processed.imageUrl);
			} catch {
				processed.imageUrl = processed.imageUrl
					.split(",")
					.map((item: string) => item.trim())
					.filter((item: string) => item);
			}
		}

		console.log("🔄 Processed data before validation:", JSON.stringify(processed, null, 2));
		return processed;
	},
	z
		.object({
			name: z
				.string()
				.min(1, "Name is required and must be a non-empty string")
				.max(255, "Name must be at most 255 characters"),
			code: z.string().max(50, "Code must be at most 50 characters").optional(),
			description: z
				.string()
				.max(1000, "Description must be at most 1000 characters")
				.optional(),
			category: FacilityCategorySchema.default("HOTEL"),
			metadata: z.union([z.string(), z.record(z.any())]).optional(), // Accept string or object, will be converted to object
			organizationId: ObjectIdSchema,
			price: z.number().min(0, "Price must be a non-negative number").optional(),
			rateTypeId: ObjectIdSchema.optional(),
			imageUrl: z.array(z.string().url("Invalid image URL")).optional().default([]),
			// Legacy fields for backward compatibility
			amenities: z.array(AmenitySchema).optional().default([]),
			roomFeatures: z.array(RoomFeatureSchema).optional().default([]),
			bedType: BedTypeSchema.optional(),
			bedCount: z.number().int().min(1).optional(),
			maxOccupancy: z.number().int().min(1).optional(),
			path: z.string().optional(),
			// For handling image removal during updates
			removeImageUrls: z.array(z.string().url("Invalid image URL")).optional(),
		})
		.refine(
			(data) => {
				// Skip validation if metadata is missing - let it be handled in controller
				if (!data.metadata) {
					return true;
				}

				// Convert string to object if it's still a string
				let metadata = data.metadata;
				if (typeof metadata === "string") {
					try {
						metadata = JSON.parse(metadata);
					} catch (error) {
						console.error("Failed to parse metadata in refine:", error);
						return false;
					}
				}

				// Custom validation: ensure metadata matches the category
				try {
					console.log("🔍 Validating metadata for category:", data.category);
					console.log("🔍 Metadata to validate:", JSON.stringify(metadata, null, 2));

					// Skip discriminated union and validate directly
					if (data.category === "HOTEL") {
						console.log("🔧 Validating with HotelMetadataSchema...");
						HotelMetadataSchema.parse(metadata);
						console.log("✅ HotelMetadataSchema validation passed!");
						return true;
					} else if (data.category === "GYM") {
						console.log("🔧 Validating with GymMetadataSchema...");
						GymMetadataSchema.parse(metadata);
						console.log("✅ GymMetadataSchema validation passed!");
						return true;
					} else if (data.category === "RESTAURANT") {
						console.log("🔧 Validating with RestaurantMetadataSchema...");
						RestaurantMetadataSchema.parse(metadata);
						console.log("✅ RestaurantMetadataSchema validation passed!");
						return true;
					} else if (data.category === "SPORTS_COURT") {
						console.log("🔧 Validating with SportsCourtMetadataSchema...");
						SportsCourtMetadataSchema.parse(metadata);
						console.log("✅ SportsCourtMetadataSchema validation passed!");
						return true;
					} else if (data.category === "CONFERENCE_ROOM") {
						console.log("🔧 Validating with ConferenceRoomMetadataSchema...");
						ConferenceRoomMetadataSchema.parse(metadata);
						console.log("✅ ConferenceRoomMetadataSchema validation passed!");
						return true;
					} else if (data.category === "PARKING") {
						console.log("🔧 Validating with ParkingMetadataSchema...");
						ParkingMetadataSchema.parse(metadata);
						console.log("✅ ParkingMetadataSchema validation passed!");
						return true;
					} else if (data.category === "AMENITY_SPACE") {
						console.log("🔧 Validating with AmenitySpaceMetadataSchema...");
						AmenitySpaceMetadataSchema.parse(metadata);
						console.log("✅ AmenitySpaceMetadataSchema validation passed!");
						return true;
					} else if (data.category === "OTHER") {
						console.log("🔧 Validating with OtherMetadataSchema...");
						OtherMetadataSchema.parse(metadata);
						console.log("✅ OtherMetadataSchema validation passed!");
						return true;
					}

					console.warn("⚠️ Unknown facility category:", data.category);
					return false;
				} catch (error) {
					console.error("❌ Metadata validation failed:", error);
					console.error("📄 Failed with category:", data.category);
					console.error("📄 Failed with metadata:", JSON.stringify(metadata, null, 2));
					return false;
				}
			},
			{
				message: "metadata must match the selected facility category",
				path: ["metadata"],
			},
		)
		.transform((data) => {
			// Final transformation to ensure metadata is an object
			if (typeof data.metadata === "string") {
				try {
					console.log("🔄 Transform: Converting metadata string to object");
					data.metadata = JSON.parse(data.metadata);
				} catch (error) {
					console.error("❌ Transform failed for metadata:", error);
					data.metadata = {};
				}
			}
			console.log("✅ Final metadata:", data.metadata);
			return data;
		}),
);

export const CreateFacilityTypeSchema = preprocessFacilityTypeData;

export const UpdateFacilityTypeSchema = z.preprocess(
	(data: any) => {
		if (!data || typeof data !== "object") return data;

		const processed = { ...data };

		// Convert string numbers to actual numbers for form data
		if (processed.price !== undefined && typeof processed.price === "string") {
			const parsedPrice = parseFloat(processed.price);
			if (!isNaN(parsedPrice)) {
				processed.price = parsedPrice;
			}
		}

		// Handle metadata if it's a string (from form data)
		if (processed.metadata && typeof processed.metadata === "string") {
			try {
				processed.metadata = JSON.parse(processed.metadata);
			} catch (error) {
				processed.metadata = {};
			}
		}

		// Handle legacy fields for backward compatibility
		if (processed.maxOccupancy !== undefined && typeof processed.maxOccupancy === "string") {
			const parsedMaxOccupancy = parseInt(processed.maxOccupancy, 10);
			if (!isNaN(parsedMaxOccupancy)) {
				processed.maxOccupancy = parsedMaxOccupancy;
			}
		}
		if (processed.bedCount !== undefined && typeof processed.bedCount === "string") {
			const parsedBedCount = parseInt(processed.bedCount, 10);
			if (!isNaN(parsedBedCount)) {
				processed.bedCount = parsedBedCount;
			}
		}

		// Handle array fields
		if (processed.amenities && typeof processed.amenities === "string") {
			try {
				processed.amenities = JSON.parse(processed.amenities);
			} catch {
				processed.amenities = processed.amenities
					.split(",")
					.map((item: string) => item.trim())
					.filter((item: string) => item);
			}
		}
		if (processed.roomFeatures && typeof processed.roomFeatures === "string") {
			try {
				processed.roomFeatures = JSON.parse(processed.roomFeatures);
			} catch {
				processed.roomFeatures = processed.roomFeatures
					.split(",")
					.map((item: string) => item.trim())
					.filter((item: string) => item);
			}
		}
		if (processed.removeImageUrls && typeof processed.removeImageUrls === "string") {
			try {
				processed.removeImageUrls = JSON.parse(processed.removeImageUrls);
			} catch {
				processed.removeImageUrls = processed.removeImageUrls
					.split(",")
					.map((item: string) => item.trim())
					.filter((item: string) => item);
			}
		}

		return processed;
	},
	z
		.object({
			name: z
				.string()
				.min(1, "Name is required and must be a non-empty string")
				.max(255, "Name must be at most 255 characters")
				.optional(),
			code: z.string().max(50, "Code must be at most 50 characters").optional(),
			description: z
				.string()
				.max(1000, "Description must be at most 1000 characters")
				.optional(),
			category: FacilityCategorySchema.optional(),
			metadata: z.union([z.string(), z.record(z.any())]).optional(),
			organizationId: ObjectIdSchema.optional(),
			price: z.number().min(0, "Price must be a non-negative number").optional(),
			rateTypeId: ObjectIdSchema.optional(),
			imageUrl: z.array(z.string().url("Invalid image URL")).optional(),
			// Legacy fields for backward compatibility
			amenities: z.array(AmenitySchema).optional(),
			roomFeatures: z.array(RoomFeatureSchema).optional(),
			bedType: BedTypeSchema.optional(),
			bedCount: z.number().int().min(1).optional(),
			maxOccupancy: z.number().int().min(1).optional(),
			path: z.string().optional(),
			// For handling image removal during updates
			removeImageUrls: z.array(z.string().url("Invalid image URL")).optional(),
		})
		.partial(),
);

export const FacilityTypeResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	code: z.string().optional(),
	description: z.string().optional(),
	category: FacilityCategorySchema,
	metadata: z.record(z.any()).nullable(), // JSON field
	organizationId: z.string(),
	price: z.number().optional(),
	rateTypeId: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
	imageUrl: z.array(z.string()),
	// Legacy fields for backward compatibility
	amenities: z.array(AmenitySchema),
	roomFeatures: z.array(RoomFeatureSchema),
	bedType: BedTypeSchema.optional(),
	bedCount: z.number().int().optional(),
	maxOccupancy: z.number().int().optional(),
});

export const FacilityTypeQuerySchema = z.object({
	organizationId: ObjectIdSchema.optional(),
	category: FacilityCategorySchema.optional(), // Filter by facility category
	name: z.string().optional(), // Search by name
	priceMin: z.number().min(0).optional(),
	priceMax: z.number().min(0).optional(),
});

// Export types
export type FacilityCategory = z.infer<typeof FacilityCategorySchema>;
export type BedType = z.infer<typeof BedTypeSchema>;
export type RoomFeature = z.infer<typeof RoomFeatureSchema>;
export type Amenity = z.infer<typeof AmenitySchema>;

// Metadata types
export type HotelMetadata = z.infer<typeof HotelMetadataSchema>;
export type GymMetadata = z.infer<typeof GymMetadataSchema>;
export type RestaurantMetadata = z.infer<typeof RestaurantMetadataSchema>;
export type SportsCourtMetadata = z.infer<typeof SportsCourtMetadataSchema>;
export type ConferenceRoomMetadata = z.infer<typeof ConferenceRoomMetadataSchema>;
export type ParkingMetadata = z.infer<typeof ParkingMetadataSchema>;
export type AmenitySpaceMetadata = z.infer<typeof AmenitySpaceMetadataSchema>;
export type OtherMetadata = z.infer<typeof OtherMetadataSchema>;

// Schema types
export type CreateFacilityTypeInput = z.infer<typeof CreateFacilityTypeSchema>;
export type UpdateFacilityTypeInput = z.infer<typeof UpdateFacilityTypeSchema>;
export type FacilityTypeResponse = z.infer<typeof FacilityTypeResponseSchema>;
export type FacilityTypeQuery = z.infer<typeof FacilityTypeQuerySchema>;
