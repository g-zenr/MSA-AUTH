# Reservation Number System

## Overview

The reservation number system automatically generates unique, human-readable reservation numbers for each new reservation created in the system.

## Format

The reservation number follows this format: `[Type][Month][LastName][TimeCode]`

### Components:

- **Type**: First letter of the reservation type (R for ROOM, F for FACILITY)
- **Month**: 2-digit month (01-12)
- **LastName**: First letter of the guest's last name
- **TimeCode**: Last 3 digits of the current timestamp

### Examples:

- `R12S696` - Room reservation in December for Smith
- `F01J696` - Facility reservation in January for Johnson
- `R06W697` - Room reservation in June for Williams

## Implementation

### Database Schema

The `reservationNumber` field has been added to the `Reservation` model with a unique constraint to ensure no duplicate reservation numbers.

### Generation Logic

1. **Type Detection**: Automatically determines if it's a ROOM or FACILITY reservation based on whether `facilityId` is provided
2. **Month Extraction**: Uses the reservation start date to get the month
3. **Guest Name**: Uses the provided `lastName` or falls back to "GUEST"
4. **Uniqueness**: Implements retry logic to ensure unique reservation numbers (up to 10 attempts)

### Error Handling

- Validates that type and last name are provided
- Throws error if unable to generate unique reservation number after multiple attempts
- Gracefully handles edge cases like empty names

## Usage

The reservation number is automatically generated and included in the reservation creation response. No additional parameters are required from the client.

### API Response

```json
{
	"id": "507f1f77bcf86cd799439011",
	"reservationNumber": "R12S696",
	"facilityId": "507f1f77bcf86cd799439012",
	"personId": "507f1f77bcf86cd799439013",
	"reservationDate": "2024-12-01T00:00:00.000Z",
	"reservationEndDate": "2024-12-03T00:00:00.000Z",
	"status": "RESERVED",
	"guests": 2
	// ... other fields
}
```

## Benefits

1. **Human Readable**: Easy to identify and communicate reservation numbers
2. **Unique**: Guaranteed uniqueness across the system
3. **Informative**: Contains useful information about the reservation type and timing
4. **Searchable**: Can be used for quick reservation lookups
5. **Audit Trail**: Helps with tracking and reporting

## Future Enhancements

Potential improvements could include:

- Custom prefixes for different organizations
- Additional encoding for special reservation types
- Integration with external booking systems
- Barcode/QR code generation for the reservation numbers
