# Field Selection Guide

## Overview

The reservation API now supports field selection for the `GET /api/reservation/{id}` endpoint, allowing you to specify which fields to include in the response. This feature helps reduce response payload size and improves performance by only returning the data you need.

## Usage

### Basic Field Selection

To select specific fields, use the `fields` query parameter with comma-separated field names:

```
GET /api/reservation/{id}?fields=price,status,guests
```

This will return only the `id`, `price`, `status`, and `guests` fields.

### Nested Field Selection

You can also select nested fields using dot notation:

```
GET /api/reservation/{id}?fields=facility.name,facility.facilityType.price,person.personalInfo.firstName
```

This will return:

- `id` (always included)
- `facility.name`
- `facility.facilityType.price`
- `person.personalInfo.firstName`

### Examples

#### Get only price information:

```
GET /api/reservation/6881c92fbaf3bed6722a6b1f?fields=price
```

Response:

```json
{
	"status": "success",
	"message": "Reservation retrieved successfully",
	"data": {
		"id": "6881c92fbaf3bed6722a6b1f",
		"price": {
			"amount": 600,
			"uom": "NIGHT",
			"appliedTax": 0,
			"appliedDiscount": 0
		}
	}
}
```

#### Get facility and person information:

```
GET /api/reservation/6881c92fbaf3bed6722a6b1f?fields=facility.name,facility.facilityType.name,person.personalInfo.firstName,person.personalInfo.lastName
```

#### Get all fields (default behavior):

```
GET /api/reservation/6881c92fbaf3bed6722a6b1f
```

## Field Selection Behavior

### Always Included Fields

- `id` - The reservation ID is always included in the response, even if not specified in the `fields` parameter.

### Available Fields

#### Top-level fields:

- `price` - Pricing information
- `status` - Reservation status
- `guests` - Number of guests
- `reservationDate` - Start date
- `reservationEndDate` - End date
- `checkInDate` - Check-in date
- `checkOutDate` - Check-out date
- `facilityId` - Assigned facility ID
- `facilityType` - Facility type
- `personId` - Person ID
- `rateTypeId` - Rate type ID
- `additionalGuests` - Additional guests information
- `specialRequests` - Special requests
- `currency` - Currency
- `paymentStatus` - Payment status
- `remarks` - Remarks
- `version` - Version
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

#### Nested fields:

- `facility.name` - Facility name
- `facility.metadata` - Facility metadata
- `facility.facilityType.name` - Facility type name
- `facility.facilityType.price` - Facility type price
- `facility.facilityType.category` - Facility type category
- `facility.facilityType.metadata` - Facility type metadata
- `facility.facilityLocations` - Facility locations
- `person.personalInfo` - Person's personal information
- `person.contactInfo` - Person's contact information
- `transactions.id` - Transaction ID
- `transactions.type` - Transaction type
- `transactions.amount` - Transaction amount
- `transactions.currency` - Transaction currency
- `transactions.status` - Transaction status
- `transactions.provider` - Transaction provider
- `transactions.providerRef` - Transaction provider reference
- `transactions.metadata` - Transaction metadata
- `transactions.createdAt` - Transaction creation timestamp
- `transactions.updatedAt` - Transaction update timestamp

## Implementation Details

The field selection feature uses the `buildFieldSelections` utility function from `utils/queryUtils.ts` to parse the `fields` parameter and build the appropriate Prisma select options.

When the `fields` parameter is provided:

1. The query is parsed using `handleQueryValidation`
2. Field selections are built using `buildFieldSelections`
3. The Prisma query uses `select` instead of `include`
4. Only the specified fields are returned

When no `fields` parameter is provided:

1. The default `include` options are used
2. All related data (facility, person, transactions) is included
3. Full response is returned

## Error Handling

- Invalid field names will be ignored (Prisma will handle this gracefully)
- Empty `fields` parameter will return all fields (default behavior)
- Whitespace in field names is automatically trimmed

## Performance Benefits

Using field selection can significantly improve API performance by:

- Reducing response payload size
- Minimizing database query complexity
- Reducing network transfer time
- Improving client-side parsing performance

## Best Practices

1. **Use field selection for mobile apps** - Reduce data transfer for mobile clients
2. **Select only needed fields** - Don't request fields you won't use
3. **Use nested selection for related data** - Get specific nested fields instead of entire objects
4. **Cache responses** - Field-specific responses can be cached more effectively
5. **Test with different field combinations** - Ensure your application works with various field selections
