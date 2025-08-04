# Facility Types by Category - Usage Guide

This guide demonstrates how to create and manage different facility types based on categories using Zod validation and helper functions.

## Available Categories

- **HOTEL**: Guest rooms and accommodation facilities
- **GYM**: Exercise and fitness equipment spaces
- **RESTAURANT**: Food service and dining establishments
- **SPORTS_COURT**: Sports and recreational court facilities
- **CONFERENCE_ROOM**: Business meeting and conference facilities
- **PARKING**: Vehicle parking spaces and garages
- **AMENITY_SPACE**: Recreational and leisure amenity facilities
- **OTHER**: Miscellaneous and specialized facilities

## JSON Examples for API Calls

### 1. HOTEL Facility Type

**Required Fields**: `name`, `category`, `organizationId`, `metadata.bedType`, `metadata.bedCount`, `metadata.maxOccupancy`

```json
{
	"name": "Deluxe Ocean Suite",
	"description": "Luxurious suite with panoramic ocean views and premium amenities",
	"code": "HOTEL_DELUXE_001",
	"category": "HOTEL",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 299.99,
	"rateTypeId": "68412c97c0c093fb4f0b0a12",
	"imageUrl": ["https://example.com/suite1.jpg", "https://example.com/suite2.jpg"],
	"metadata": {
		"bedType": "KING_BED",
		"bedCount": 1,
		"maxOccupancy": 2,
		"amenities": ["ROOM_SERVICE", "CONCIERGE_SERVICE", "SPA_SERVICES", "VALET_PARKING"],
		"roomFeatures": [
			"WIFI",
			"TELEVISION",
			"MINIBAR",
			"SAFE",
			"BALCONY",
			"JACUZZI",
			"OCEAN_VIEW",
			"PRIVATE_BATHROOM",
			"AIR_CONDITIONING"
		]
	}
}
```

### 2. GYM Facility Type

**Required Fields**: `name`, `category`, `organizationId`, `metadata.capacity`

```json
{
	"name": "Premium Fitness Center",
	"description": "State-of-the-art fitness facility with modern equipment and personal training",
	"code": "GYM_PREMIUM_001",
	"category": "GYM",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 45.0,
	"metadata": {
		"equipment": [
			"Treadmills",
			"Elliptical Machines",
			"Weight Machines",
			"Free Weights",
			"Rowing Machines",
			"Stationary Bikes"
		],
		"hasTrainer": true,
		"openingHours": "5:00 AM - 11:00 PM",
		"capacity": 50,
		"specialtyArea": "Cardio and Strength Training"
	}
}
```

### 3. RESTAURANT Facility Type

**Required Fields**: `name`, `category`, `organizationId`, `metadata.seatingCapacity`

```json
{
	"name": "Mediterranean Bistro",
	"description": "Authentic Mediterranean cuisine with fresh ingredients and ocean views",
	"code": "REST_MED_001",
	"category": "RESTAURANT",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 75.0,
	"metadata": {
		"cuisineType": "Mediterranean",
		"seatingCapacity": 80,
		"hasDelivery": false,
		"hasTakeout": true,
		"openingHours": "11:00 AM - 10:00 PM",
		"menuUrl": "https://example.com/mediterranean-menu",
		"avgMealPrice": 45.5
	}
}
```

### 4. SPORTS_COURT Facility Type

**Required Fields**: `name`, `category`, `organizationId`, `metadata.sportType`

```json
{
	"name": "Championship Tennis Court",
	"description": "Professional-grade tennis court with premium clay surface",
	"code": "TENNIS_CHAMP_001",
	"category": "SPORTS_COURT",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 80.0,
	"metadata": {
		"sportType": "Tennis",
		"surfaceType": "Clay",
		"isIndoor": false,
		"maxPlayers": 4,
		"equipmentProvided": ["Net", "Court Lines", "Ball Storage", "Scoreboard"],
		"openingHours": "6:00 AM - 10:00 PM"
	}
}
```

### 5. CONFERENCE_ROOM Facility Type

**Required Fields**: `name`, `category`, `organizationId`, `metadata.seatingCapacity`

```json
{
	"name": "Executive Boardroom",
	"description": "Premium boardroom for executive meetings",
	"code": "CONF_EXEC_001",
	"category": "CONFERENCE_ROOM",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 150.0,
	"metadata": {
		"seatingCapacity": 12,
		"hasProjector": true,
		"hasWhiteboard": true,
		"hasVideoConferencing": true,
		"hasAudioSystem": true,
		"layout": "Boardroom",
		"equipment": ["Smart TV", "Conference Phone", "Wireless Presentation System"]
	}
}
```

### 6. PARKING Facility Type

**Required Fields**: `name`, `category`, `organizationId`

```json
{
	"name": "Premium Valet Parking",
	"description": "Full-service valet parking with car care",
	"code": "PARK_VALET_001",
	"category": "PARKING",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 35.0,
	"metadata": {
		"vehicleType": "Car",
		"isUnderground": true,
		"isCovered": true,
		"hasElectricCharging": true,
		"maxVehicleHeight": 2.1,
		"securityLevel": "Valet"
	}
}
```

### 7. AMENITY_SPACE Facility Type

**Required Fields**: `name`, `category`, `organizationId`, `metadata.amenityType`

```json
{
	"name": "Infinity Pool",
	"description": "Stunning infinity pool with panoramic views",
	"code": "AMEN_POOL_001",
	"category": "AMENITY_SPACE",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 45.0,
	"metadata": {
		"amenityType": "Pool",
		"capacity": 50,
		"requiresReservation": false,
		"openingHours": "6:00 AM - 10:00 PM",
		"ageRestriction": "All Ages",
		"additionalFees": 0
	}
}
```

### 8. OTHER Facility Type

**Required Fields**: `name`, `category`, `organizationId`, `metadata.customType`

```json
{
	"name": "Event Hall",
	"description": "Multi-purpose event and banquet hall",
	"code": "OTHER_EVENT_001",
	"category": "OTHER",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"price": 120.0,
	"metadata": {
		"customType": "Event Hall",
		"description": "Large versatile space for events, weddings, and conferences",
		"features": ["Stage", "Sound System", "Lighting", "Catering Kitchen", "Dance Floor"],
		"requirements": ["Event Insurance", "Security Deposit"],
		"capacity": 200,
		"openingHours": "24/7 with reservation"
	}
}
```

## Price Ranges by Category

| Category        | Minimum | Maximum   | Base Price |
| --------------- | ------- | --------- | ---------- |
| HOTEL           | $50.00  | $1,000.00 | $100.00    |
| GYM             | $10.00  | $100.00   | $25.00     |
| RESTAURANT      | $20.00  | $200.00   | $50.00     |
| SPORTS_COURT    | $20.00  | $150.00   | $40.00     |
| CONFERENCE_ROOM | $30.00  | $300.00   | $75.00     |
| PARKING         | $5.00   | $50.00    | $15.00     |
| AMENITY_SPACE   | $10.00  | $100.00   | $30.00     |
| OTHER           | $10.00  | $200.00   | $25.00     |

## API Usage Examples

### Create Facility Type

```bash
POST {{base_url}}/api/facilityType
Content-Type: application/json

{
  "name": "Deluxe Ocean Suite",
  "category": "HOTEL",
  "organizationId": "68412c97c0c093fb4f0b0a11",
  "price": 299.99,
  "metadata": {
    "bedType": "KING_BED",
    "bedCount": 1,
    "maxOccupancy": 2
  }
}
```

### Update Facility Type

```bash
PUT {{base_url}}/api/facilityType/{facilityTypeId}
Content-Type: application/json

{
  "price": 349.99,
  "metadata": {
    "bedType": "KING_BED",
    "bedCount": 1,
    "maxOccupancy": 2,
    "amenities": ["ROOM_SERVICE", "SPA_SERVICES"]
  }
}
```

### Get Facility Types with Field Selection

```bash
GET {{base_url}}/api/facilityType?fields=name,category,price,metadata.bedType,metadata.maxOccupancy
```

### Filter by Category

```bash
GET {{base_url}}/api/facilityType?filter=[{"category":"HOTEL"}]
```

### Check Availability with Fields

```bash
GET {{base_url}}/api/facility/availability?startDate=1852652401&endDate=1852652401&filter=[{"category":"HOTEL"}]&fields=name,category,availableCount,totalCount,price
```

## Validation Helper Functions

### TypeScript Usage

```typescript
import {
	validateFacilityTypeByCategory,
	isValidPriceForCategory,
	getRequiredFieldsForCategory,
	createFacilityTypeExamples,
	preprocessFacilityTypeData,
} from "./helper/services/facilityTypeCategoryHelper";

// Validate facility type data
const validationResult = validateFacilityTypeByCategory({
	name: "Deluxe Suite",
	category: "HOTEL",
	organizationId: "68412c97c0c093fb4f0b0a11",
	metadata: {
		bedType: "KING_BED",
		bedCount: 1,
		maxOccupancy: 2,
	},
});

if (!validationResult.success) {
	console.log("Validation errors:", validationResult.errors);
}

// Check price validity
const isValidPrice = isValidPriceForCategory("HOTEL", 299.99); // true

// Get required fields
const requiredFields = getRequiredFieldsForCategory("HOTEL");
// Returns: ["name", "category", "organizationId", "metadata.bedType", "metadata.bedCount", "metadata.maxOccupancy"]

// Get examples
const examples = createFacilityTypeExamples();
console.log(examples.HOTEL); // Returns hotel facility type example

// Preprocess form data
const processedData = preprocessFacilityTypeData(rawFormData);
```

## Error Handling

### Common Validation Errors

1. **Missing Required Fields**

```json
{
	"success": false,
	"errors": [
		{
			"field": "metadata.bedType",
			"message": "metadata.bedType is required for HOTEL facilities"
		}
	]
}
```

2. **Invalid Price Range**

```json
{
	"success": false,
	"errors": [
		{
			"field": "price",
			"message": "Price must be between 50 and 1000 for HOTEL facilities"
		}
	]
}
```

3. **Invalid Metadata**

```json
{
	"success": false,
	"errors": [
		{
			"field": "metadata.maxOccupancy",
			"message": "Expected number, received string"
		}
	]
}
```

## Best Practices

1. **Always validate data** before saving using `validateFacilityTypeByCategory`
2. **Use appropriate price ranges** for each category
3. **Include all required fields** based on category
4. **Preprocess form data** to handle string-to-number conversions
5. **Use type guards** for runtime type checking
6. **Handle arrays properly** in metadata (amenities, features, etc.)
7. **Provide meaningful codes** for easier identification
8. **Include descriptive names** and descriptions

## Migration Guide

If you need to migrate existing facility types to use category-specific metadata:

1. Identify the appropriate category for each facility type
2. Map existing fields to the new metadata structure
3. Validate the migrated data using validation helpers
4. Update your API calls to include category-specific metadata
5. Test thoroughly with the new validation rules
