# Facility Bulk Creation Guide

This guide explains how to use the bulk creation feature for facilities, particularly useful for creating multiple rooms with sequential numbering.

## Overview

The bulk creation feature allows you to create multiple facilities (rooms) in a single API call with automatic room number incrementing. This is particularly useful for hotels, hostels, or any accommodation facilities that need to create multiple similar rooms.

## Usage

### Basic Bulk Creation

To trigger bulk creation, include a `bulkCreate` object in your facility creation request:

```json
{
	"name": "Family Room",
	"facilityTypeId": "6879b1dcb7360cea1110e548",
	"description": "Comfortable family room with queen bed",
	"organizationId": "68412c97c0c093fb4f0b0a11",
	"location": {
		"floor": "1",
		"roomLabel": "405"
	},
	"metadata": {
		"bedType": "Queen",
		"maxOccupancy": 2
	},
	"bulkCreate": {
		"roomStart": 1,
		"roomEnd": 10
	}
}
```

### What Happens During Bulk Creation

When you specify `bulkCreate`, the system will:

1. **Create Multiple Facilities**: Generate facilities from `roomStart` to `roomEnd` (inclusive)
2. **Auto-increment Names**: Each facility name will be updated to include the room number
    - Base name: "Family Room" → "Family Room 1", "Family Room 2", etc.
3. **Update Metadata**: Automatically adds/updates `metadata.roomNumber` with the room number as a string
4. **Update FacilityLocation**: If `facilityLocations.roomLabel` exists, it will be updated with the room number

### Example Result

The above request would create 10 facilities:

- "Family Room 1" with `metadata.roomNumber: "1"` and `facilityLocations.roomLabel: "1"`
- "Family Room 2" with `metadata.roomNumber: "2"` and `facilityLocations.roomLabel: "2"`
- ...
- "Family Room 10" with `metadata.roomNumber: "10"` and `facilityLocations.roomLabel: "10"`

## API Response

### Successful Bulk Creation Response

```json
{
	"status": "success",
	"message": "Successfully created 10 facilities",
	"data": {
		"facilities": [
			{
				"id": "...",
				"name": "Family Room 1",
				"facilityTypeId": "6879b1dcb7360cea1110e548",
				"description": "Comfortable family room with queen bed",
				"organizationId": "68412c97c0c093fb4f0b0a11",
				"location": {
					"floor": "1",
					"roomLabel": "1"
				},
				"metadata": {
					"bedType": "Queen",
					"maxOccupancy": 2,
					"roomNumber": "1"
				}
				// ... other facility fields
			}
			// ... additional facilities
		],
		"bulkDetails": {
			"roomStart": 1,
			"roomEnd": 10,
			"totalCreated": 10
		}
	}
}
```

## Validation Rules

### Room Range Validation

- `roomStart` must be a positive integer
- `roomEnd` must be a positive integer
- `roomEnd` must be greater than or equal to `roomStart`
- Maximum of 100 rooms can be created in a single bulk operation

### Error Examples

```json
// Invalid range
{
  "bulkCreate": {
    "roomStart": 10,
    "roomEnd": 5  // Error: roomEnd must be >= roomStart
  }
}

// Too many rooms
{
  "bulkCreate": {
    "roomStart": 1,
    "roomEnd": 150  // Error: Maximum 100 rooms allowed
  }
}
```

## Use Cases

### Hotel Room Creation

Create sequential hotel rooms on a floor:

```json
{
	"name": "Standard Room",
	"facilityTypeId": "hotel-room-type-id",
	"description": "Standard hotel room with modern amenities",
	"organizationId": "hotel-org-id",
	"location": {
		"floor": "3",
		"building": "Main Building"
	},
	"metadata": {
		"bedType": "Queen",
		"maxOccupancy": 2,
		"hasBalcony": false
	},
	"bulkCreate": {
		"roomStart": 301,
		"roomEnd": 320
	}
}
```

This creates rooms: "Standard Room 301", "Standard Room 302", ..., "Standard Room 320"

### Conference Room Creation

Create multiple conference rooms:

```json
{
	"name": "Conference Room",
	"facilityTypeId": "conference-room-type-id",
	"description": "Modern conference room with AV equipment",
	"organizationId": "office-org-id",
	"location": {
		"floor": "2",
		"wing": "East Wing"
	},
	"metadata": {
		"capacity": 10,
		"hasProjector": true,
		"hasWhiteboard": true
	},
	"bulkCreate": {
		"roomStart": 1,
		"roomEnd": 5
	}
}
```

This creates: "Conference Room 1", "Conference Room 2", ..., "Conference Room 5"

## Single vs Bulk Creation

### Single Creation (Default)

If you don't include `bulkCreate`, the system works as before, creating a single facility with the exact name and metadata provided.

### Automatic Detection

The system automatically detects whether to create single or multiple facilities based on the presence of the `bulkCreate` field.

## Best Practices

1. **Consistent Naming**: Use descriptive base names that work well with numbers ("Room", "Suite", "Office")
2. **Metadata Planning**: Include relevant metadata that applies to all rooms in the bulk creation
3. **Room Numbering**: Consider your organization's room numbering convention (floor-based, sequential, etc.)
4. **Batch Size**: Keep bulk creation requests reasonable (under 50 rooms for better performance)
5. **Validation**: Always validate the room range before sending the request

## Error Handling

The bulk creation feature includes comprehensive error handling:

- **Validation Errors**: Invalid room ranges or missing required fields
- **Limit Errors**: Exceeding the 100-room limit
- **Database Errors**: Issues during facility creation (partial creation may occur)
- **Permission Errors**: Insufficient permissions for the organization

If any error occurs during bulk creation, the API will return a detailed error message with the specific issue and error code.
