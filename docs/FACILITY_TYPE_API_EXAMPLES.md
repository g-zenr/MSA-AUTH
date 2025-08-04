# Facility Type API Examples

The facility type endpoints now support advanced query parameters including `fields` and `filter` for both `getAll` and `getById` operations.

## Available Query Parameters

- **`page`** - Page number for pagination (default: 1)
- **`limit`** - Number of items per page (default: 10)
- **`sort`** - Field to sort by (default: createdAt)
- **`order`** - Sort order: `asc` or `desc` (default: desc)
- **`query`** - Basic search across facility type name, description, code, and organization name
- **`fields`** - Comma-separated list of fields to include in response
- **`filter`** - JSON array of filter objects for advanced filtering

## GET All Facility Types

### Basic Usage

```http
GET {{base_url}}/api/facilityType
```

### With Pagination

```http
GET {{base_url}}/api/facilityType?page=1&limit=5
```

### With Basic Search

```http
GET {{base_url}}/api/facilityType?query=Standard
```

### With Field Selection

```http
GET {{base_url}}/api/facilityType?fields=id,name,code,price,maxOccupancy,organization.name
```

### With Complex Filtering

```http
GET {{base_url}}/api/facilityType?filter=[{"name":"Standard Room"}]
```

### Filter by Code

```http
GET {{base_url}}/api/facilityType?filter=[{"code":"STD"}]
```

### Filter by Price Range

```http
GET {{base_url}}/api/facilityType?filter=[{"price":"150.00"}]
```

### Filter by Max Occupancy

```http
GET {{base_url}}/api/facilityType?filter=[{"maxOccupancy":"2"}]
```

### Filter by Organization

```http
GET {{base_url}}/api/facilityType?filter=[{"organization.name":"Main Hotel"}]
```

### Filter by Amenities

```http
GET {{base_url}}/api/facilityType?filter=[{"amenities":"WIFI"}]
```

### Filter by Room Features

```http
GET {{base_url}}/api/facilityType?filter=[{"roomFeatures":"BALCONY"}]
```

### Multiple Filters (OR condition)

```http
GET {{base_url}}/api/facilityType?filter=[{"name":"Standard"},{"name":"Deluxe"}]
```

### Combined Query Parameters

```http
GET {{base_url}}/api/facilityType?fields=id,name,price,maxOccupancy&filter=[{"maxOccupancy":"2"}]&page=1&limit=10&sort=price&order=asc
```

## GET Facility Type by ID

### Basic Usage

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID
```

### With Field Selection

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?fields=id,name,code,price,amenities,roomFeatures,facilities,organization
```

### With Specific Fields Only

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?fields=name,price,maxOccupancy,organization.name
```

### Filter Related Facilities

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?filter=[{"facilities.isAvailable":"true"}]
```

### Filter Available Facilities Only

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?filter=[{"facilities.isActive":"true","facilities.isAvailable":"true"}]
```

### Filter by Room Number

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?filter=[{"facilities.roomNumber":"101"}]
```

### Filter Organization Information

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?filter=[{"organization.name":"Main Hotel"}]
```

## Response Format

### GET All Facility Types Response

```json
{
	"facilityTypes": [
		{
			"id": "64f1b2c3d4e5f6789a0b1c2d",
			"name": "Standard Room",
			"code": "STD",
			"description": "Standard room with basic amenities",
			"price": 150.0,
			"maxOccupancy": 2,
			"amenities": ["WIFI", "TV", "AC"],
			"roomFeatures": ["CITY_VIEW"],
			"imageUrl": ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
			"organization": {
				"id": "64f1b2c3d4e5f6789a0b1c2e",
				"name": "Main Hotel",
				"description": "Main hotel property"
			},
			"facilities": [
				{
					"id": "64f1b2c3d4e5f6789a0b1c2f",
					"name": "HOTEL DE LUNA - Room 101",
					"roomNumber": "101",
					"isAvailable": true,
					"isActive": true
				}
			],
			"createdAt": "2024-01-01T10:00:00Z",
			"updatedAt": "2024-01-01T10:00:00Z"
		}
	],
	"total": 15,
	"page": 1,
	"totalPages": 2,
	"limit": 10
}
```

### GET Facility Type by ID Response

```json
{
	"id": "64f1b2c3d4e5f6789a0b1c2d",
	"name": "Standard Room",
	"code": "STD",
	"description": "Standard room with basic amenities and modern furnishing",
	"price": 150.0,
	"maxOccupancy": 2,
	"amenities": ["WIFI", "TV", "AC", "MINIBAR"],
	"roomFeatures": ["CITY_VIEW", "BALCONY"],
	"imageUrl": [
		"https://res.cloudinary.com/demo/image/upload/sample1.jpg",
		"https://res.cloudinary.com/demo/image/upload/sample2.jpg"
	],
	"isActive": true,
	"organization": {
		"id": "64f1b2c3d4e5f6789a0b1c2e",
		"name": "Main Hotel",
		"description": "Main hotel property"
	},
	"facilities": [
		{
			"id": "64f1b2c3d4e5f6789a0b1c2f",
			"name": "HOTEL DE LUNA - Room 101",
			"roomNumber": "101",
			"description": "Standard room on first floor",
			"isAvailable": true,
			"isActive": true,
			"location": {
				"floor": "1",
				"wing": "North",
				"building": "Main Building"
			},
			"createdAt": "2024-01-01T10:00:00Z",
			"updatedAt": "2024-01-01T10:00:00Z"
		},
		{
			"id": "64f1b2c3d4e5f6789a0b1c30",
			"name": "HOTEL DE LUNA - Room 102",
			"roomNumber": "102",
			"description": "Standard room on first floor",
			"isAvailable": false,
			"isActive": true,
			"location": {
				"floor": "1",
				"wing": "North",
				"building": "Main Building"
			},
			"createdAt": "2024-01-01T10:00:00Z",
			"updatedAt": "2024-01-01T10:00:00Z"
		}
	],
	"createdAt": "2024-01-01T10:00:00Z",
	"updatedAt": "2024-01-01T10:00:00Z"
}
```

## Advanced Filtering Examples

### Complex Price-based Filtering

```http
GET {{base_url}}/api/facilityType?filter=[{"price":"150.00"},{"price":"200.00"}]
```

### Multiple Amenity Filtering

```http
GET {{base_url}}/api/facilityType?filter=[{"amenities":"WIFI","amenities":"TV"}]
```

### Occupancy and Feature Filtering

```http
GET {{base_url}}/api/facilityType?filter=[{"maxOccupancy":"4","roomFeatures":"BALCONY"}]
```

### Organization-based Filtering

```http
GET {{base_url}}/api/facilityType?filter=[{"organization.name":"Main Hotel"}]
```

### Available Facilities Filtering

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?filter=[{"facilities.isAvailable":"true","facilities.isActive":"true"}]
```

### Facility Location Filtering

```http
GET {{base_url}}/api/facilityType/FACILITY_TYPE_ID?filter=[{"facilities.facilityLocations.building":"Building A"}]
```

## Field Selection Examples

### Basic Information Only

```http
GET {{base_url}}/api/facilityType?fields=id,name,code,price
```

### With Organization Details

```http
GET {{base_url}}/api/facilityType?fields=id,name,price,organization.name,organization.description
```

### With Facility Count

```http
GET {{base_url}}/api/facilityType?fields=id,name,price,facilities.id
```

### Full Details

```http
GET {{base_url}}/api/facilityType?fields=id,name,code,description,price,maxOccupancy,amenities,roomFeatures,imageUrl,organization,facilities
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

### Facility Type Not Found

```json
{
	"error": "Facility type not found"
}
```

### Invalid ID Parameter

```json
{
	"error": "Invalid facility type ID"
}
```

## Common Use Cases

### 1. Get All Room Types with Pricing

```http
GET {{base_url}}/api/facilityType?fields=id,name,code,price,maxOccupancy&sort=price&order=asc
```

### 2. Find Available Room Types

```http
GET {{base_url}}/api/facilityType?filter=[{"facilities.isAvailable":"true"}]&fields=id,name,price,facilities.id
```

### 3. Search Room Types by Amenities

```http
GET {{base_url}}/api/facilityType?filter=[{"amenities":"WIFI"}]&fields=id,name,amenities,price
```

### 4. Get Room Types for Specific Organization

```http
GET {{base_url}}/api/facilityType?filter=[{"organization.name":"Main Hotel"}]&fields=id,name,price,organization.name
```

### 5. Room Types with Capacity Filter

```http
GET {{base_url}}/api/facilityType?filter=[{"maxOccupancy":"4"}]&fields=id,name,maxOccupancy,price
```

## Notes

1. **Pagination**: The `getAll` endpoint supports pagination with `page` and `limit` parameters
2. **Field Selection**: Use dot notation for nested fields (e.g., `organization.name`, `facilities.facilityLocations.building`)
3. **Filtering**: Filters use case-insensitive contains matching for text fields
4. **Image URLs**: Images are stored in Cloudinary and returned as secure URLs
5. **Performance**: Using `fields` parameter can improve performance by selecting only needed data
6. **Relations**: The API automatically includes related facilities and organization data
7. **Amenities & Features**: These are stored as arrays and support filtering by individual values
