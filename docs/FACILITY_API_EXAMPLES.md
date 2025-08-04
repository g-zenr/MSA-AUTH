# Facility API Examples

The facility endpoints now support advanced query parameters including `fields` and `filter` for both `getAll` and `getById` operations.

## Available Query Parameters

- **`page`** - Page number for pagination (default: 1)
- **`limit`** - Number of items per page (default: 10)
- **`sort`** - Field to sort by (default: createdAt)
- **`order`** - Sort order: `asc` or `desc` (default: desc)
- **`query`** - Basic search across facility name, description, room number, facility type name, and organization name
- **`fields`** - Comma-separated list of fields to include in response
- **`filter`** - JSON array of filter objects for advanced filtering

## GET All Facilities

### Basic Usage

```http
GET {{base_url}}/api/facility
```

### With Pagination

```http
GET {{base_url}}/api/facility?page=1&limit=5
```

### With Basic Search

```http
GET {{base_url}}/api/facility?query=HOTEL
```

### With Field Selection

```http
GET {{base_url}}/api/facility?fields=id,name,roomNumber,location,facilityType.name,organization.name
```

### With Complex Filtering

```http
GET {{base_url}}/api/facility?filter=[{"name":"HOTEL DE LUNA"}]
```

### Filter by Facility Type

```http
GET {{base_url}}/api/facility?filter=[{"facilityType.name":"Standard Room"}]
```

### Filter by Organization

```http
GET {{base_url}}/api/facility?filter=[{"organization.name":"Main Hotel"}]
```

### Filter by Room Number

```http
GET {{base_url}}/api/facility?filter=[{"roomNumber":"101"}]
```

### Filter by Location

```http
GET {{base_url}}/api/facility?filter=[{"facilityLocations.building":"Building A"}]
```

### Multiple Filters (OR condition)

```http
GET {{base_url}}/api/facility?filter=[{"name":"HOTEL"},{"roomNumber":"101"}]
```

### Combined Query Parameters

```http
GET {{base_url}}/api/facility?fields=id,name,roomNumber,facilityType.name&filter=[{"facilityType.name":"Standard Room"}]&page=1&limit=10&sort=name&order=asc
```

## GET Facility by ID

### Basic Usage

```http
GET {{base_url}}/api/facility/FACILITY_ID
```

### With Field Selection

```http
GET {{base_url}}/api/facility/FACILITY_ID?fields=id,name,roomNumber,location,facilityType,reservations
```

### With Specific Fields Only

```http
GET {{base_url}}/api/facility/FACILITY_ID?fields=name,facilityLocations.building,facilityType.name
```

### Filter Related Data

```http
GET {{base_url}}/api/facility/FACILITY_ID?filter=[{"reservations.status":"RESERVED"}]
```

### Filter Facility Type Information

```http
GET {{base_url}}/api/facility/FACILITY_ID?filter=[{"facilityType.name":"Deluxe Suite"}]
```

## Response Format

### GET All Facilities Response

```json
{
	"facilities": [
		{
			"id": "64f1b2c3d4e5f6789a0b1c2d",
			"name": "HOTEL DE LUNA - Room 101",
			"roomNumber": "101",
			"description": "Standard room with city view",
			"location": {
				"floor": "1",
				"wing": "North",
				"building": "Main Building"
			},
			"isAvailable": true,
			"isActive": true,
			"facilityType": {
				"id": "64f1b2c3d4e5f6789a0b1c2e",
				"name": "Standard Room",
				"price": 150.0
			},
			"organization": {
				"id": "64f1b2c3d4e5f6789a0b1c2f",
				"name": "Main Hotel"
			},
			"reservations": [
				{
					"id": "64f1b2c3d4e5f6789a0b1c30",
					"status": "RESERVED",
					"reservationDate": "2024-01-15T14:00:00Z",
					"reservationEndDate": "2024-01-17T11:00:00Z"
				}
			],
			"createdAt": "2024-01-01T10:00:00Z",
			"updatedAt": "2024-01-01T10:00:00Z"
		}
	],
	"total": 25,
	"page": 1,
	"totalPages": 3,
	"limit": 10
}
```

### GET Facility by ID Response

```json
{
	"id": "64f1b2c3d4e5f6789a0b1c2d",
	"name": "HOTEL DE LUNA - Room 101",
	"roomNumber": "101",
	"description": "Standard room with city view",
	"location": {
		"floor": "1",
		"wing": "North",
		"section": "A",
		"building": "Main Building",
		"roomLabel": "101-A",
		"accessNotes": "Key card access required"
	},
	"isAvailable": true,
	"isActive": true,
	"facilityType": {
		"id": "64f1b2c3d4e5f6789a0b1c2e",
		"name": "Standard Room",
		"description": "Standard room with modern amenities",
		"price": 150.0,
		"amenities": ["WIFI", "TV", "AC"],
		"roomFeatures": ["CITY_VIEW", "BALCONY"],
		"maxOccupancy": 2
	},
	"organization": {
		"id": "64f1b2c3d4e5f6789a0b1c2f",
		"name": "Main Hotel",
		"description": "Main hotel property"
	},
	"reservations": [
		{
			"id": "64f1b2c3d4e5f6789a0b1c30",
			"status": "RESERVED",
			"reservationDate": "2024-01-15T14:00:00Z",
			"reservationEndDate": "2024-01-17T11:00:00Z",
			"checkInDate": null,
			"checkOutDate": null,
			"guests": 2,
			"user": {
				"id": "64f1b2c3d4e5f6789a0b1c31",
				"userName": "john.doe",
				"email": "john@example.com"
			}
		}
	],
	"createdAt": "2024-01-01T10:00:00Z",
	"updatedAt": "2024-01-01T10:00:00Z"
}
```

## Advanced Filtering Examples

### Complex Nested Filtering

```http
GET {{base_url}}/api/facility?filter=[{"facilityLocations.building":"Building A"},{"facilityType.maxOccupancy":"4"}]
```

### Multiple Field Filtering

```http
GET {{base_url}}/api/facility?filter=[{"isAvailable":"true","isActive":"true"}]
```

### Date-based Filtering (for reservations)

```http
GET {{base_url}}/api/facility/FACILITY_ID?filter=[{"reservations.reservationDate":"2024-01-15"}]
```

### Status-based Filtering

```http
GET {{base_url}}/api/facility?filter=[{"reservations.status":"CHECKED_IN"}]
```

## Error Responses

### Invalid Fields Parameter

```json
{
	"error": "Fields parameter must be a comma-separated string"
}
```

### Invalid Filter Parameter

```json
{
	"error": "Filter must be valid JSON array"
}
```

### Facility Not Found

```json
{
	"error": "Facility not found"
}
```

## Notes

1. **Field Selection**: Use the `fields` parameter to specify which fields to include in the response
2. **Filtering**: Use the `filter` parameter to filter results based on field values
3. **Pagination**: Results are paginated by default with configurable page size
4. **Temporal Data**: Active reservations are automatically included
