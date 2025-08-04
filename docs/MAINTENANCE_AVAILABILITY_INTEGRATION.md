# Maintenance and Facility Availability Integration

## Overview

The facility availability system now considers maintenance records when determining if a facility is available for booking. Facilities that are under maintenance with status `IN_PROGRESS` during the requested date range will be excluded from availability results.

## How It Works

### Maintenance Status Filtering

When checking facility availability, the system will exclude facilities that have:

- Maintenance records with status `IN_PROGRESS`
- Maintenance period that overlaps with the requested reservation dates
- This includes ongoing maintenance (where `endDate` is null)

### Affected Endpoints

The following availability endpoints now consider maintenance status:

1. **GET /api/facility/availability** - Main availability check endpoint
2. **GET /api/reservation/availability** - Reservation availability check
3. All internal availability service functions

### Maintenance Status Types

From the `MaintenanceStatus` enum:

- `PENDING` - Scheduled but not started (facilities remain available)
- `IN_PROGRESS` - Active maintenance (facilities become unavailable)
- `COMPLETED` - Finished maintenance (facilities return to availability)
- `CANCELLED` - Cancelled maintenance (facilities remain available)
- `DEFERRED` - Postponed maintenance (facilities remain available)

## Examples

### Example 1: Simple Availability Check

```bash
GET /api/facility/availability?startDate=2025-07-02T15:00:00Z&endDate=2025-07-03T15:00:00Z
```

This will return available facilities, excluding any that have `IN_PROGRESS` maintenance during July 2-3, 2025.

### Example 2: Maintenance Record Affecting Availability

If Room 101 has a maintenance record:

```json
{
	"id": "maintenance123",
	"facilityId": "room101",
	"status": "IN_PROGRESS",
	"startDate": "2025-07-02T10:00:00Z",
	"endDate": "2025-07-02T18:00:00Z",
	"description": "AC unit repair"
}
```

Then Room 101 will not appear in availability results for any reservation period that overlaps with July 2, 10:00-18:00.

### Example 3: Ongoing Maintenance (No End Date)

If a facility has maintenance with no end date:

```json
{
	"id": "maintenance456",
	"facilityId": "room102",
	"status": "IN_PROGRESS",
	"startDate": "2025-07-01T09:00:00Z",
	"endDate": null,
	"description": "Major renovation"
}
```

Room 102 will be unavailable for any future reservation until the maintenance is completed or cancelled.

## API Response Changes

The availability response format remains the same, but the counts will reflect facilities excluded due to maintenance:

```json
{
	"facilityTypes": [
		{
			"facilityType": "Standard Room",
			"isAvailable": true,
			"availableCount": 8,
			"totalCount": 10,
			"reservedCount": 1,
			// Note: totalCount includes all facilities, availableCount excludes maintenance
			"facilities": [
				// Only facilities not under maintenance or reserved
			]
		}
	],
	"availableFacilityTypes": 1,
	"totalFacilityTypes": 1
}
```

## Database Queries

The system now performs additional queries to check for overlapping maintenance records:

```sql
-- Example maintenance check query
SELECT facilityId FROM MaintenanceRecord
WHERE status = 'IN_PROGRESS'
AND (
  (startDate <= reservationEnd AND endDate >= reservationStart)
  OR (startDate <= reservationEnd AND endDate IS NULL)
)
```

## Performance Considerations

- Each availability check now performs one additional database query for maintenance records
- The queries are optimized to only fetch the minimum required fields (`facilityId`)
- Maintenance checks are combined with reservation checks to minimize the impact on response times

## Integration Points

### Room Assignment

When automatically assigning rooms during check-in, the system will skip facilities under maintenance.

### Reservation Validation

The system prevents booking facilities that will be under maintenance during the reservation period.

### Availability Reports

All availability reports and analytics will reflect maintenance-adjusted availability.

## Future Enhancements

- Add maintenance schedule preview in availability responses
- Support for partial facility closures (e.g., specific amenities under maintenance)
- Maintenance impact notifications for existing reservations
- Automatic rebooking suggestions when facilities become unavailable due to maintenance
