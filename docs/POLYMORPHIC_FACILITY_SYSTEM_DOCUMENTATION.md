# Polymorphic Facility System Documentation

## Overview

The facility management system uses a polymorphic design pattern where `FacilityType` entities can represent different categories of facilities (hotels, gyms, restaurants, etc.), each with their own specific metadata structure stored in a flexible JSON field called `details`.

## Database Architecture

### Core Models

#### FacilityType Model

```prisma
model FacilityType {
  id             String        @id @default(auto()) @map("_id") @db.ObjectId
  name           String        // e.g., "Deluxe Ocean View Room"
  code           String?       // e.g., "DOV-001"
  description    String?       // Human-readable description
  category       FacilityCategory  @default(HOTEL)  // Determines details schema
  details        Json?         // Polymorphic JSON field - structure varies by category
  organization   Organization  @relation(fields: [organizationId], references: [id])
  organizationId String        @db.ObjectId
  facilities     Facility[]    // One-to-many relationship
  price          Float?        // Base price if applicable
  rateTypeId     String?       @db.ObjectId
  rateType       RateType?     @relation(fields: [rateTypeId], references: [id])
  isDeleted      Boolean       @default(false)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  imageUrl       String[]      // Array of image URLs
}
```

#### Facility Model

```prisma
model Facility {
  id                     String               @id @default(auto()) @map("_id") @db.ObjectId
  name                   String               // e.g., "Room 101"
  facilityTypeId         String?              @db.ObjectId
  facilityType           FacilityType?        @relation(fields: [facilityTypeId], references: [id])
  description            String?
  locationId             String?              @db.ObjectId
  location               Location?            @relation(fields: [locationId], references: [id])
  organization           Organization         @relation(fields: [organizationId], references: [id])
  organizationId         String               @db.ObjectId
  meta                   Json?                // Instance-specific data (roomNumber, tags, etc.)
  isAvailable            Boolean              @default(true)
  isActive               Boolean              @default(true)
  isDeleted              Boolean              @default(false)
  // ... other fields (housekeeping, maintenance, reservations)
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt
}
```

### Facility Categories

The system supports 8 different facility categories, each with specific metadata schemas:

```typescript
enum FacilityCategory {
  HOTEL           // Hotel rooms and accommodations
  GYM             // Fitness facilities and gyms
  RESTAURANT      // Dining establishments
  SPORTS_COURT    // Sports courts and recreational areas
  CONFERENCE_ROOM // Meeting and conference rooms
  PARKING         // Parking spaces and garages
  AMENITY_SPACE   // General amenity areas (pools, spas, etc.)
  OTHER           // Custom facility types
}
```

## Polymorphic Details Structure

The `details` field in `FacilityType` is polymorphic - its structure changes based on the `category` field. Here's how each category maps to its specific metadata:

### Field Requirements Summary

| Category            | Required Fields                       | Optional Fields                                                                                          | Key Features                   |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **HOTEL**           | `bedType`, `bedCount`, `maxOccupancy` | `amenities[]`, `roomFeatures[]`                                                                          | Accommodation-specific details |
| **GYM**             | None                                  | `equipment[]`, `hasTrainer`, `openingHours`, `capacity`, `specialtyArea`                                 | Fitness facility management    |
| **RESTAURANT**      | None                                  | `cuisineType`, `seatingCapacity`, `hasDelivery`, `hasTakeout`, `openingHours`, `menuUrl`, `avgMealPrice` | Dining service details         |
| **SPORTS_COURT**    | `sportType`                           | `surfaceType`, `isIndoor`, `maxPlayers`, `equipmentProvided[]`, `openingHours`                           | Sports facility specifics      |
| **CONFERENCE_ROOM** | `seatingCapacity`                     | `hasProjector`, `hasWhiteboard`, `hasVideoConferencing`, `hasAudioSystem`, `layout`, `equipment[]`       | Meeting room capabilities      |
| **PARKING**         | None                                  | `vehicleType`, `isUnderground`, `isCovered`, `hasElectricCharging`, `maxVehicleHeight`, `securityLevel`  | Parking space details          |
| **AMENITY_SPACE**   | `amenityType`                         | `capacity`, `requiresReservation`, `openingHours`, `ageRestriction`, `additionalFees`                    | General amenity management     |
| **OTHER**           | `customType`                          | `description`, `features[]`, `requirements[]`, `capacity`, `openingHours`                                | Flexible custom types          |

### Data Types & Validation Rules

#### Common Field Types

- **string**: Text fields with optional length constraints
- **number**: Integer or float values with minimum constraints
- **boolean**: True/false values with default settings
- **string[]**: Arrays of strings for lists (equipment, amenities, etc.)
- **enum**: Predefined string constants (BedType, FacilityCategory, etc.)

#### Key Validation Rules

- **Required fields**: Must be present and non-empty
- **Optional fields**: Can be omitted or null, often have default values
- **Array fields**: Can be empty arrays but must be valid arrays when present
- **Number fields**: Minimum value constraints (typically min: 1 for capacity fields, min: 0 for prices)
- **URL fields**: Must be valid URL format when provided
- **Enum fields**: Must match predefined values (case-sensitive)

### 1. HOTEL Category

```typescript
interface HotelMetadata {
	bedType: BedType; // SINGLE_BED, DOUBLE_BED, QUEEN_BED, etc.
	bedCount: number; // Number of beds (min: 1)
	maxOccupancy: number; // Maximum number of guests (min: 1)
	amenities: Amenity[]; // Array of amenities (WIFI, AC, MINIBAR, etc.)
	roomFeatures: RoomFeature[]; // Array of features (BALCONY, OCEAN_VIEW, etc.)
}
```

**Example Database Record:**

```json
{
	"id": "64a1b2c3d4e5f6789012345a",
	"name": "Deluxe Ocean View Suite",
	"category": "HOTEL",
	"details": {
		"bedType": "KING_BED",
		"bedCount": 1,
		"maxOccupancy": 4,
		"amenities": ["WIFI", "AIR_CONDITIONING", "MINIBAR", "SAFE"],
		"roomFeatures": ["BALCONY", "OCEAN_VIEW", "SEATING_AREA"]
	},
	"price": 299.99
}
```

### 2. GYM Category

```typescript
interface GymMetadata {
	equipment: string[]; // Available equipment
	hasTrainer: boolean; // Trainer availability
	openingHours: string; // Operating hours
	capacity?: number; // Maximum occupancy
	specialtyArea?: string; // Cardio, Weights, Yoga, etc.
}
```

**Example Database Record:**

```json
{
	"id": "64a1b2c3d4e5f6789012345b",
	"name": "Main Fitness Center",
	"category": "GYM",
	"details": {
		"equipment": ["Treadmills", "Free Weights", "Elliptical", "Rowing Machine"],
		"hasTrainer": true,
		"openingHours": "5:00 AM - 11:00 PM",
		"capacity": 50,
		"specialtyArea": "Cardio and Strength Training"
	},
	"price": 25.0
}
```

### 3. RESTAURANT Category

```typescript
interface RestaurantMetadata {
	cuisineType?: string; // Type of cuisine
	seatingCapacity?: number; // Number of seats
	hasDelivery?: boolean; // Delivery service available
	hasTakeout?: boolean; // Takeout service available
	openingHours?: string; // Operating hours
	menuUrl?: string; // URL to menu
	avgMealPrice?: number; // Average meal price
}
```

### 4. SPORTS_COURT Category

```typescript
interface SportsCourtMetadata {
	sportType: string; // Tennis, Basketball, Volleyball, etc.
	surfaceType?: string; // Clay, Hardcourt, Grass, etc.
	isIndoor?: boolean; // Indoor or outdoor
	maxPlayers?: number; // Maximum players allowed
	equipmentProvided?: string[]; // Equipment provided
	openingHours?: string; // Operating hours
}
```

### 5. CONFERENCE_ROOM Category

```typescript
interface ConferenceRoomMetadata {
	seatingCapacity: number; // Required field
	hasProjector?: boolean; // Projector availability
	hasWhiteboard?: boolean; // Whiteboard availability
	hasVideoConferencing?: boolean; // Video conferencing setup
	hasAudioSystem?: boolean; // Audio system availability
	layout?: string; // Theater, Classroom, U-Shape, etc.
	equipment?: string[]; // Additional equipment
}
```

### 6. PARKING Category

```typescript
interface ParkingMetadata {
	vehicleType?: string; // Car, Motorcycle, Truck, etc.
	isUnderground?: boolean; // Underground parking
	isCovered?: boolean; // Covered parking
	hasElectricCharging?: boolean; // EV charging station
	maxVehicleHeight?: number; // Height restriction (meters)
	securityLevel?: string; // Basic, Monitored, Gated
}
```

### 7. AMENITY_SPACE Category

```typescript
interface AmenitySpaceMetadata {
	amenityType: string; // Pool, Spa, Library, Garden, etc.
	capacity?: number; // Maximum occupancy
	requiresReservation?: boolean; // Reservation required
	openingHours?: string; // Operating hours
	ageRestriction?: string; // Adults Only, All Ages, 18+
	additionalFees?: number; // Additional usage fees
}
```

### 8. OTHER Category

```typescript
interface OtherMetadata {
	customType: string; // Custom facility type name
	description?: string; // Additional description
	features?: string[]; // Array of features
	requirements?: string[]; // Array of requirements
	capacity?: number; // Maximum occupancy
	openingHours?: string; // Operating hours
}
```

## Validation Flow

The system implements strict validation to ensure that the `details` field matches the selected `category`:

### 1. Input Preprocessing

```typescript
// Form data is preprocessed to handle string-to-object conversions
const preprocessedData = {
	...rawFormData,
	details:
		typeof rawFormData.details === "string"
			? JSON.parse(rawFormData.details)
			: rawFormData.details,
};
```

### 2. Category-Specific Validation

```typescript
// Each category has its own validation schema
switch (category) {
	case "HOTEL":
		return HotelMetadataSchema.parse(details);
	case "GYM":
		return GymMetadataSchema.parse(details);
	// ... other categories
}
```

### 3. Type Guards for Runtime Checking

```typescript
export const isHotelMetadata = (
	category: FacilityCategory,
	metadata: any,
): metadata is HotelMetadata => {
	return category === "HOTEL" && HotelMetadataSchema.safeParse(metadata).success;
};
```

## Utility Functions

### Capacity Extraction

```typescript
export const getFacilityCapacity = (category: FacilityCategory, metadata: any): number | null => {
	switch (category) {
		case "HOTEL":
			return isHotelMetadata(category, metadata) ? metadata.maxOccupancy : null;
		case "GYM":
			return isGymMetadata(category, metadata) ? metadata.capacity || null : null;
		case "RESTAURANT":
			return isRestaurantMetadata(category, metadata)
				? metadata.seatingCapacity || null
				: null;
		// ... other categories
	}
	return null;
};
```

### Opening Hours Extraction

```typescript
export const getOpeningHours = (category: FacilityCategory, metadata: any): string | null => {
	switch (category) {
		case "HOTEL":
			return "24/7"; // Hotels are typically always open
		case "GYM":
			return isGymMetadata(category, metadata) ? metadata.openingHours || null : null;
		// ... other categories
	}
	return null;
};
```

### Searchable Text Extraction

```typescript
export const getSearchableMetadataText = (category: FacilityCategory, metadata: any): string[] => {
	const searchableText: string[] = [];

	switch (category) {
		case "HOTEL":
			if (isHotelMetadata(category, metadata)) {
				searchableText.push(metadata.bedType);
				searchableText.push(...metadata.amenities);
				searchableText.push(...metadata.roomFeatures);
			}
			break;
		// ... other categories
	}

	return searchableText;
};
```

## Usage Examples

### Creating a Hotel Facility Type

```typescript
const hotelFacilityType = {
	name: "Executive Suite",
	category: "HOTEL",
	details: {
		bedType: "KING_BED",
		bedCount: 1,
		maxOccupancy: 3,
		amenities: ["WIFI", "MINIBAR", "SAFE", "AIR_CONDITIONING"],
		roomFeatures: ["BALCONY", "CITY_VIEW", "SEATING_AREA"],
	},
	organizationId: "64a1b2c3d4e5f6789012345c",
	price: 450.0,
};
```

### Creating Individual Facilities

```typescript
const hotelRoom = {
	name: "Room 501",
	facilityTypeId: "64a1b2c3d4e5f6789012345a", // References the hotel facility type
	location: {
		floor: "5",
		wing: "North",
		roomLabel: "501",
	},
	meta: {
		roomNumber: "501",
		tags: ["VIP", "Corner Room"],
	},
	organizationId: "64a1b2c3d4e5f6789012345c",
};
```

### Querying Facilities by Category

```typescript
// Find all hotel facility types
const hotelTypes = await prisma.facilityType.findMany({
	where: {
		category: "HOTEL",
		isDeleted: false,
	},
	include: {
		facilities: true,
	},
});

// Filter by specific metadata
const kingSizeRooms = hotelTypes.filter(
	(type) => isHotelMetadata(type.category, type.details) && type.details.bedType === "KING_BED",
);
```

## Benefits of This Architecture

### 1. **Type Safety**

- TypeScript interfaces ensure compile-time type checking
- Zod schemas provide runtime validation
- Type guards prevent runtime errors

### 2. **Flexibility**

- Easy to add new facility categories
- Category-specific fields without database schema changes
- Support for complex nested data structures

### 3. **Maintainability**

- Clear separation of concerns
- Centralized validation logic
- Consistent API patterns across categories

### 4. **Performance**

- Single table for facility types reduces joins
- JSON indexing available for frequently queried fields
- Efficient querying with Prisma's JSON operators

### 5. **Extensibility**

- New categories can be added without breaking existing data
- Legacy data migration helpers included
- Default metadata generation for each category

## Migration and Legacy Support

The system includes migration helpers for backward compatibility:

```typescript
export const migrateLegacyFacilityType = (legacyData: any) => {
	// If it already has the new structure, return as is
	if (legacyData.category && legacyData.details) {
		return legacyData;
	}

	// Default to HOTEL category for legacy data
	const category: FacilityCategory = "HOTEL";
	const details: HotelMetadata = {
		bedType: legacyData.bedType || "SINGLE_BED",
		bedCount: legacyData.bedCount || 1,
		maxOccupancy: legacyData.maxOccupancy || 1,
		amenities: legacyData.amenities || [],
		roomFeatures: legacyData.roomFeatures || [],
	};

	return {
		...legacyData,
		category,
		details,
	};
};
```

This polymorphic design provides a robust, type-safe, and scalable foundation for managing diverse facility types while maintaining data integrity and developer experience.
