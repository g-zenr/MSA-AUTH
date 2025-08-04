# Room Type Reservation System Guide

## Overview

The **Room Type Reservation System** allows front desk staff to:

1. **Search for available room types** instead of specific rooms
2. **Create reservations without assigning specific rooms**
3. **Automatically assign rooms during check-in** based on availability

This is perfect for hotel management where guests book a "room type" (e.g., "Deluxe Suite") and the actual room is assigned at check-in based on availability.

## Available Room Types

- `SINGLE` - Single occupancy room
- `DOUBLE` - Double occupancy room
- `SUITE` - Suite room
- `STANDARD_ROOM` - Standard hotel room
- `DELUXE_SUITE` - Deluxe suite
- `EXECUTIVE_SUITE` - Executive suite
- `PRESIDENTIAL_SUITE` - Presidential suite

## API Endpoints

### 1. Check Room Type Availability

**Endpoint:** `GET /api/reservation/room-type/availability`

**Description:** Check if a specific room type has available rooms for given dates.

**Query Parameters:**

- `roomType` (required): Room type to check
- `checkInDate` (required): Check-in date (ISO format)
- `checkOutDate` (required): Check-out date (ISO format)
- `organizationId` (optional): Filter by organization

**Example Request:**

```bash
GET /api/reservation/room-type/availability?roomType=DELUXE_SUITE&checkInDate=2025-06-20T15:00:00Z&checkOutDate=2025-06-22T11:00:00Z
```

**Example Response:**

```json
{
	"roomType": "DELUXE_SUITE",
	"availableCount": 2,
	"totalCount": 5,
	"isAvailable": true,
	"availableRooms": [
		{
			"facilityId": "60d5ecb54b24d1a123456789",
			"roomNumber": "201",
			"name": "Deluxe Suite Ocean View",
			"pricePerNight": 350.0
		},
		{
			"facilityId": "60d5ecb54b24d1a123456790",
			"roomNumber": "203",
			"name": "Deluxe Suite Garden View",
			"pricePerNight": 320.0
		}
	]
}
```

### 2. Check All Room Types Availability

**Endpoint:** `GET /api/reservation/room-types/availability`

**Description:** Get availability status for all room types in the organization.

**Query Parameters:**

- `checkInDate` (required): Check-in date (ISO format)
- `checkOutDate` (required): Check-out date (ISO format)
- `organizationId` (optional): Filter by organization

**Example Request:**

```bash
GET /api/reservation/room-types/availability?checkInDate=2025-06-20T15:00:00Z&checkOutDate=2025-06-22T11:00:00Z
```

**Example Response:**

```json
{
	"checkInDate": "2025-06-20T15:00:00Z",
	"checkOutDate": "2025-06-22T11:00:00Z",
	"roomTypes": [
		{
			"roomType": "SINGLE",
			"availableCount": 5,
			"totalCount": 10,
			"isAvailable": true
		},
		{
			"roomType": "DOUBLE",
			"availableCount": 3,
			"totalCount": 8,
			"isAvailable": true
		},
		{
			"roomType": "DELUXE_SUITE",
			"availableCount": 0,
			"totalCount": 5,
			"isAvailable": false
		}
	],
	"availableRoomTypes": 2,
	"totalRoomTypes": 3
}
```

### 3. Create Room Type Reservation

**Endpoint:** `POST /api/reservation`

**Description:** Create a reservation by room type instead of specific facility.

**Request Body:**

```json
{
	"roomType": "DELUXE_SUITE",
	"checkInDate": "2025-06-20T15:00:00Z",
	"checkOutDate": "2025-06-22T11:00:00Z",
	"guests": 2,
	"firstName": "John",
	"lastName": "Doe",
	"email": "john.doe@example.com",
	"additionalGuests": [
		{
			"firstName": "Jane",
			"lastName": "Doe",
			"phone": "+1234567890"
		}
	],
	"specialRequests": "Ocean view preferred"
}
```

**Response:**

```json
{
	"id": "60d5ecb54b24d1a123456791",
	"facilityId": null,
	"roomType": "DELUXE_SUITE",
	"userId": "60d5ecb54b24d1a123456792",
	"checkInDate": "2025-06-20T15:00:00.000Z",
	"checkOutDate": "2025-06-22T11:00:00.000Z",
	"status": "RESERVED",
	"guests": 2,
	"additionalGuests": [
		{
			"firstName": "Jane",
			"lastName": "Doe",
			"phone": "+1234567890"
		}
	],
	"specialRequests": "Ocean view preferred",
	"createdAt": "2025-01-20T10:30:00.000Z",
	"updatedAt": "2025-01-20T10:30:00.000Z",
	"facility": null,
	"user": {
		"id": "60d5ecb54b24d1a123456792",
		"userName": "john.doe.1737370200",
		"email": "john.doe@example.com",
		"person": {
			"personalInfo": {
				"firstName": "John",
				"lastName": "Doe"
			}
		}
	}
}
```

### 4. Auto-Assign Room During Check-In

**Endpoint:** `POST /api/reservation/{id}/auto-assign-room`

**Description:** Automatically assign an available room to a room type reservation during check-in.

**Example Request:**

```bash
POST /api/reservation/60d5ecb54b24d1a123456791/auto-assign-room
```

**Example Response:**

```json
{
	"message": "Room auto-assigned successfully",
	"assignedFacilityId": "60d5ecb54b24d1a123456789",
	"reservation": {
		"id": "60d5ecb54b24d1a123456791",
		"facilityId": "60d5ecb54b24d1a123456789",
		"roomType": "DELUXE_SUITE",
		"userId": "60d5ecb54b24d1a123456792",
		"checkInDate": "2025-06-20T15:00:00.000Z",
		"checkOutDate": "2025-06-22T11:00:00.000Z",
		"status": "RESERVED",
		"guests": 2,
		"facility": {
			"id": "60d5ecb54b24d1a123456789",
			"name": "Deluxe Suite Ocean View",
			"type": "HOTEL",
			"roomNumber": "201",
			"pricePerNight": 350.0
		},
		"user": {
			"id": "60d5ecb54b24d1a123456792",
			"userName": "john.doe.1737370200",
			"email": "john.doe@example.com"
		}
	}
}
```

## Workflow Examples

### Scenario 1: Front Desk Search & Reservation

1. **Guest arrives wanting a Deluxe Suite for June 20-22, 2025**

2. **Front desk checks availability:**

    ```bash
    GET /api/reservation/room-type/availability?roomType=DELUXE_SUITE&checkInDate=2025-06-20T15:00:00Z&checkOutDate=2025-06-22T11:00:00Z
    ```

3. **System responds:** 2 Deluxe Suites available

4. **Front desk creates room type reservation:**

    ```bash
    POST /api/reservation
    {
      "roomType": "DELUXE_SUITE",
      "checkInDate": "2025-06-20T15:00:00Z",
      "checkOutDate": "2025-06-22T11:00:00Z",
      "guests": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
    ```

5. **Guest arrives for check-in on June 20th**

6. **Front desk assigns room automatically:**

    ```bash
    POST /api/reservation/{reservationId}/auto-assign-room
    ```

7. **System assigns best available room and updates reservation**

### Scenario 2: No Specific Room Available

1. **Guest wants Presidential Suite**

2. **Front desk checks:**

    ```bash
    GET /api/reservation/room-type/availability?roomType=PRESIDENTIAL_SUITE&checkInDate=2025-06-20T15:00:00Z&checkOutDate=2025-06-22T11:00:00Z
    ```

3. **System responds:** `isAvailable: false, availableCount: 0`

4. **Front desk can offer alternatives or waitlist**

### Scenario 3: Overview of All Room Types

1. **Front desk wants to see all availability:**

    ```bash
    GET /api/reservation/room-types/availability?checkInDate=2025-06-20T15:00:00Z&checkOutDate=2025-06-22T11:00:00Z
    ```

2. **System shows all room types with availability counts**

3. **Front desk can recommend available alternatives to guest**

## Technical Features

### Smart Availability Calculation

The system considers:

- **Specific room reservations** (facilityId assigned)
- **Room type reservations** (roomType without facilityId)
- **Overlapping date ranges**
- **Reservation statuses** (excludes cancelled/checked-out)

### Transaction Safety

- All operations use database transactions
- Prevents double bookings
- Ensures data consistency
- Handles concurrent reservations

### Auto-Assignment Logic

- Finds first available room of requested type
- Updates reservation with specific facilityId
- Maintains roomType for reference
- Returns detailed room information

### Business Rules

- Either `facilityId` OR `roomType` required (not both)
- Room type reservations have `facilityId: null`
- Auto-assignment only works for room type reservations
- Availability excludes cancelled/checked-out reservations

## Error Handling

### Common Errors

**400 Bad Request:**

- Missing required parameters
- Invalid date formats
- Room type not available

**404 Not Found:**

- Reservation not found (for auto-assignment)

**500 Internal Server Error:**

- Database connection issues
- Unexpected server errors

### Example Error Response

```json
{
	"error": "No rooms available for room type: PRESIDENTIAL_SUITE"
}
```

## Integration Notes

### For Frontend Applications

1. **Search Page:** Use room type availability endpoints
2. **Booking Flow:** Create reservations with roomType
3. **Check-in Process:** Use auto-assignment endpoint
4. **Dashboard:** Show availability overview

### For Mobile Apps

All endpoints support standard HTTP methods and JSON responses, making integration straightforward for mobile applications.

### For Third-party Systems

The API follows RESTful principles and provides comprehensive OpenAPI documentation for easy integration.
