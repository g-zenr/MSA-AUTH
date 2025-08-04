# 🏛️ Polymorphic Facility Types Guide

This guide explains the industry-standard polymorphic approach implemented for the `FacilityType` model, following MongoDB + Prisma best practices.

## 🎯 Overview

We've implemented a **discriminated union pattern** using:

- **`kind`** - Discriminator field (enum)
- **`typeMetadata`** - JSON field containing kind-specific data
- **Zod validation** - Type-safe validation per facility kind
- **Backward compatibility** - Legacy fields preserved during transition

## 📋 Facility Kinds Supported

| Kind              | Use Case            | Required Fields                       |
| ----------------- | ------------------- | ------------------------------------- |
| `HOTEL`           | Hotel rooms, suites | `bedType`, `bedCount`, `maxOccupancy` |
| `GYM`             | Fitness facilities  | `equipment[]`, `hasTrainer`           |
| `RESTAURANT`      | Dining facilities   | `cuisineType`, `seatingCapacity`      |
| `SPORTS_COURT`    | Sports facilities   | `sportType`, `maxPlayers`             |
| `CONFERENCE_ROOM` | Meeting spaces      | `seatingCapacity`, `hasProjector`     |
| `PARKING`         | Parking spaces      | `vehicleType`, `isCovered`            |
| `AMENITY_SPACE`   | Pool, spa, etc.     | `amenityType`, `capacity`             |
| `OTHER`           | Custom facilities   | `customType`, `features[]`            |

## 🔧 API Examples

### Creating a Hotel Room

```javascript
POST /api/facilityType
{
  "name": "Deluxe Ocean Suite",
  "code": "DOS",
  "kind": "HOTEL",
  "typeMetadata": {
    "bedType": "KING_BED",
    "bedCount": 1,
    "maxOccupancy": 2,
    "amenities": ["WIFI", "MINIBAR", "OCEAN_VIEW"],
    "roomFeatures": ["BALCONY", "JACUZZI", "PRIVATE_BATHROOM"]
  },
  "organizationId": "507f1f77bcf86cd799439011",
  "price": 299.99,
  "description": "Luxurious suite with ocean view"
}
```

### Creating a Gym Facility

```javascript
POST /api/facilityType
{
  "name": "Cardio Zone",
  "code": "CZ",
  "kind": "GYM",
  "typeMetadata": {
    "equipment": ["Treadmill", "Elliptical", "Stationary Bike"],
    "hasTrainer": true,
    "openingHours": "5:00 AM - 11:00 PM",
    "capacity": 25,
    "specialtyArea": "Cardio"
  },
  "organizationId": "507f1f77bcf86cd799439011",
  "price": 50.00
}
```

### Creating a Conference Room

```javascript
POST /api/facilityType
{
  "name": "Executive Boardroom",
  "code": "EBR",
  "kind": "CONFERENCE_ROOM",
  "typeMetadata": {
    "seatingCapacity": 12,
    "hasProjector": true,
    "hasWhiteboard": true,
    "hasVideoConferencing": true,
    "hasAudioSystem": true,
    "layout": "U-Shape",
    "equipment": ["Projector", "Sound System", "Whiteboard", "Video Conference"]
  },
  "organizationId": "507f1f77bcf86cd799439011",
  "price": 200.00
}
```

## 🔍 Query Examples

### Filter by Facility Kind

```javascript
GET /api/facilityType?kind=HOTEL
GET /api/facilityType?kind=GYM
GET /api/facilityType?kind=CONFERENCE_ROOM
```

### Search Across All Kinds

```javascript
GET /api/facilityType?query=wifi
GET /api/facilityType?query=projector
GET /api/facilityType?query=ocean
```

### Complex Filtering

```javascript
GET /api/facilityType?kind=HOTEL&filter=price:gte:200&filter=maxOccupancy:gte:2
GET /api/facilityType?kind=GYM&query=trainer
```

## 🛠️ TypeScript Usage

### Working with Type Guards

```typescript
import {
	isHotelMetadata,
	isGymMetadata,
	getFacilityCapacity,
	getOpeningHours,
} from "../helper/services/facilityTypeHelper";

// Type-safe metadata access
const facilityType = await prisma.facilityType.findUnique({
	where: { id: facilityId },
});

if (isHotelMetadata(facilityType.kind, facilityType.typeMetadata)) {
	// TypeScript knows this is HotelMetadata
	console.log(`Bed type: ${facilityType.typeMetadata.bedType}`);
	console.log(`Max occupancy: ${facilityType.typeMetadata.maxOccupancy}`);
}

if (isGymMetadata(facilityType.kind, facilityType.typeMetadata)) {
	// TypeScript knows this is GymMetadata
	console.log(`Equipment: ${facilityType.typeMetadata.equipment.join(", ")}`);
	console.log(`Has trainer: ${facilityType.typeMetadata.hasTrainer}`);
}
```

### Using Helper Functions

```typescript
// Get capacity regardless of facility kind
const capacity = getFacilityCapacity(facilityType.kind, facilityType.typeMetadata);

// Get opening hours if applicable
const hours = getOpeningHours(facilityType.kind, facilityType.typeMetadata);

// Check if reservation is required
const needsReservation = requiresReservation(facilityType.kind, facilityType.typeMetadata);
```

## 🔄 Migration Strategy

### Backward Compatibility

The implementation maintains **full backward compatibility**:

- Legacy fields (`bedType`, `bedCount`, `maxOccupancy`, etc.) are preserved
- Existing APIs continue to work
- Gradual migration is supported

### Migration Helper

```typescript
import { migrateLegacyFacilityType } from "../helper/services/facilityTypeHelper";

// Migrate existing data
const legacyFacilityType = {
	name: "Standard Room",
	bedType: "QUEEN_BED",
	bedCount: 1,
	maxOccupancy: 2,
	amenities: ["WIFI", "TELEVISION"],
	roomFeatures: ["PRIVATE_BATHROOM"],
};

const migratedData = migrateLegacyFacilityType(legacyFacilityType);
// Result: Automatically adds kind: "HOTEL" and moves data to typeMetadata
```

## 📊 Database Schema

### New Structure

```prisma
model FacilityType {
  id             String        @id @default(auto()) @map("_id") @db.ObjectId
  name           String
  code           String?
  description    String?
  kind           FacilityKind  @default(HOTEL)      // Discriminator
  typeMetadata   Json                                // Polymorphic data
  organizationId String        @db.ObjectId
  price          Float?
  imageUrl       String[]

  // Legacy fields (backward compatibility)
  amenities      Amenity[]     @default([])
  roomFeatures   RoomFeature[] @default([])
  bedType        BedType?
  bedCount       Int?
  maxOccupancy   Int?
}
```

## 🧪 Validation Examples

### Hotel Metadata Validation

```typescript
const hotelMetadata = {
	bedType: "KING_BED",
	bedCount: 1,
	maxOccupancy: 2,
	amenities: ["WIFI", "MINIBAR"],
	roomFeatures: ["BALCONY", "OCEAN_VIEW"],
};

// Automatic validation via Zod discriminated union
const result = CreateFacilityTypeSchema.safeParse({
	name: "Ocean Suite",
	kind: "HOTEL",
	typeMetadata: hotelMetadata,
	organizationId: "507f1f77bcf86cd799439011",
});
```

### Gym Metadata Validation

```typescript
const gymMetadata = {
	equipment: ["Treadmill", "Weights"],
	hasTrainer: true,
	openingHours: "6AM-10PM",
	capacity: 30,
};

const result = CreateFacilityTypeSchema.safeParse({
	name: "Main Gym",
	kind: "GYM",
	typeMetadata: gymMetadata,
	organizationId: "507f1f77bcf86cd799439011",
});
```

## 🚀 Benefits of This Approach

### ✅ Advantages

1. **Extensible** - Easy to add new facility kinds
2. **Type Safe** - Full TypeScript support with discriminated unions
3. **MongoDB Optimized** - Leverages JSON document structure
4. **Validation** - Automatic validation per facility kind
5. **Backward Compatible** - Smooth migration path
6. **Performance** - Single table, no joins required

### 📈 Scalability

- Add new facility kinds by extending enums and metadata schemas
- MongoDB handles JSON queries efficiently
- Prisma provides type safety at compile time

## 🔧 Adding New Facility Kinds

### 1. Update Prisma Schema

```prisma
enum FacilityKind {
  // ... existing kinds
  NEW_KIND
}
```

### 2. Create Zod Metadata Schema

```typescript
export const NewKindMetadataSchema = z.object({
	customField: z.string(),
	anotherField: z.number().optional(),
});
```

### 3. Update Discriminated Union

```typescript
export const TypeMetadataSchema = z.discriminatedUnion("kind", [
	// ... existing kinds
	z.object({ kind: z.literal("NEW_KIND"), metadata: NewKindMetadataSchema }),
]);
```

### 4. Add Helper Functions

```typescript
export const isNewKindMetadata = (
	kind: FacilityKind,
	metadata: any,
): metadata is NewKindMetadata => {
	return kind === "NEW_KIND" && NewKindMetadataSchema.safeParse(metadata).success;
};
```

## 🎯 Best Practices

1. **Always validate** metadata against facility kind
2. **Use type guards** for runtime type safety
3. **Leverage helper functions** for common operations
4. **Test discriminated unions** thoroughly
5. **Document metadata schemas** for each facility kind
6. **Use migration helpers** for legacy data

## 📚 Related Files

- `prisma/schema/facilityType.prisma` - Database schema
- `zod/facilityType.zod.ts` - Validation schemas
- `helper/services/facilityTypeHelper.ts` - Helper functions
- `app/facilityType/facilityType.controller.ts` - API controller
- `app/facilityType/facilityType.router.ts` - API routes

---

🎉 **Congratulations!** You now have a robust, industry-standard polymorphic facility type system that's extensible, type-safe, and MongoDB-optimized.
