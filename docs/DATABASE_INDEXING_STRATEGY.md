# Database Indexing Strategy

This document outlines the comprehensive indexing strategy implemented across the LMS API database to optimize query performance and support efficient data retrieval operations.

## Overview

The indexing strategy focuses on:

- **Query Performance**: Optimizing common query patterns
- **Filtering Efficiency**: Supporting complex filtering operations
- **Search Operations**: Enabling fast text-based searches
- **Relationship Queries**: Optimizing joins and relationship lookups
- **Soft Delete Support**: Efficient filtering of deleted records

## Index Categories

### 1. Primary Key Indexes

All models have automatic indexes on their `id` field (MongoDB ObjectId).

### 2. Unique Constraint Indexes

- `User.email` and `User.userName` - for authentication lookups
- `Reservation.reservationNumber` - for reservation number lookups
- `Organization.code` - for organization code lookups

### 3. Foreign Key Indexes

All foreign key relationships have dedicated indexes for efficient joins:

- `User.personId` → `Person.id`
- `User.organizationId` → `Organization.id`
- `Person.organizationId` → `Organization.id`
- `Facility.organizationId` → `Organization.id`
- `Reservation.personId` → `Person.id`
- `Reservation.facilityId` → `Facility.id`
- `Payment.reservationId` → `Reservation.id`
- `Transaction.personId` → `Person.id`
- `Transaction.reservationId` → `Reservation.id`
- `MaintenanceRecord.facilityId` → `Facility.id`
- `MaintenanceRecord.maintainedById` → `User.id`
- `HousekeepingRecord.facilityId` → `Facility.id`
- `HousekeepingRecord.cleanedById` → `User.id`

### 4. Status and State Indexes

For efficient filtering by status and state:

- `User.status` - for active/inactive user filtering
- `User.role` - for role-based access control
- `Person.metadata.status` - for person status filtering
- `Person.metadata.isActive` - for active person filtering
- `Person.metadata.isDeleted` - for soft delete filtering
- `Facility.isDeleted` - for soft delete filtering
- `Reservation.status` - for reservation status filtering
- `Reservation.paymentStatus` - for payment status filtering
- `MaintenanceRecord.status` - for maintenance status filtering
- `HousekeepingRecord.status` - for housekeeping status filtering
- `Payment.status` - for payment status filtering
- `Transaction.status` - for transaction status filtering
- `Organization.isDeleted` - for soft delete filtering

### 5. Date and Time Indexes

For temporal queries and sorting:

- `User.lastLogin` - for user activity tracking
- `User.createdAt` - for user creation date filtering
- `Person.metadata.lastLoginAt` - for person activity tracking
- `Reservation.reservationDate` - for reservation date filtering
- `Reservation.reservationEndDate` - for reservation end date filtering
- `Reservation.checkInDate` - for check-in date filtering
- `Reservation.checkOutDate` - for check-out date filtering
- `Reservation.createdAt` - for reservation creation date filtering
- `MaintenanceRecord.date` - for maintenance date filtering
- `MaintenanceRecord.startDate` - for maintenance start date filtering
- `MaintenanceRecord.endDate` - for maintenance end date filtering
- `MaintenanceRecord.createdAt` - for maintenance creation date filtering
- `HousekeepingRecord.date` - for housekeeping date filtering
- `HousekeepingRecord.startDate` - for housekeeping start date filtering
- `HousekeepingRecord.endDate` - for housekeeping end date filtering
- `HousekeepingRecord.createdAt` - for housekeeping creation date filtering
- `Payment.paidAt` - for payment date filtering
- `Payment.createdAt` - for payment creation date filtering
- `Transaction.createdAt` - for transaction creation date filtering
- `Organization.createdAt` - for organization creation date filtering
- `Facility.createdAt` - for facility creation date filtering
- `FacilityType.createdAt` - for facility type creation date filtering
- `FacilityLocation.createdAt` - for facility location creation date filtering
- `RateType.createdAt` - for rate type creation date filtering

### 6. Search and Text Indexes

For text-based searches:

- `User.email` - for email-based user lookups
- `User.userName` - for username-based user lookups
- `Person.personalInfo.firstName` - for first name searches
- `Person.personalInfo.lastName` - for last name searches
- `Person.personalInfo.gender` - for gender-based filtering
- `Person.personalInfo.nationality` - for nationality-based filtering
- `Person.contactInfo.email` - for email-based person searches
- `Person.identification.type` - for ID type filtering
- `Person.identification.number` - for ID number searches
- `Facility.name` - for facility name searches
- `FacilityType.name` - for facility type name searches
- `FacilityType.code` - for facility type code lookups
- `FacilityLocation.building` - for building-based filtering
- `FacilityLocation.floor` - for floor-based filtering
- `FacilityLocation.nearby` - for landmark-based filtering
- `Organization.name` - for organization name searches
- `Organization.code` - for organization code lookups
- `RateType.name` - for rate type name searches
- `RateType.code` - for rate type code lookups

### 7. Business Logic Indexes

For domain-specific queries:

- `User.loginMethod` - for authentication method filtering
- `Facility.isTimeBased` - for time-based facility filtering
- `Facility.facilityTypeId` - for facility type filtering
- `Facility.facilityLocationId` - for facility location filtering
- `Reservation.facilityType` - for room type filtering
- `Reservation.marketCode` - for market code filtering
- `Reservation.sourceCode` - for source code filtering
- `Reservation.bookingChannel` - for booking channel filtering
- `Reservation.vipStatus` - for VIP status filtering
- `Reservation.currency` - for currency-based filtering
- `Reservation.rateTypeId` - for rate type filtering
- `Reservation.guests` - for guest count filtering
- `Payment.method` - for payment method filtering
- `Payment.amount` - for payment amount filtering
- `Payment.transactionId` - for external transaction ID lookups
- `Transaction.type` - for transaction type filtering
- `Transaction.amount` - for transaction amount filtering
- `Transaction.currency` - for transaction currency filtering
- `Transaction.provider` - for payment provider filtering
- `FacilityType.category` - for facility category filtering
- `FacilityType.price` - for price-based filtering
- `FacilityType.rateTypeId` - for rate type filtering

### 8. Composite Indexes

For complex query patterns:

- `User.role, User.status` - for role-based active user filtering
- `User.organizationId, User.status` - for organization-based active user filtering
- `User.organizationId, User.role` - for organization-based role filtering
- `User.isDeleted, User.status` - for soft delete with status filtering
- `Person.organizationId, Person.metadata.isDeleted` - for organization-based person filtering
- `Person.organizationId, Person.metadata.status` - for organization-based person status filtering
- `Person.metadata.isDeleted, Person.metadata.status` - for soft delete with status filtering
- `Facility.organizationId, Facility.isDeleted` - for organization-based facility filtering
- `Facility.facilityTypeId, Facility.isDeleted` - for facility type with soft delete filtering
- `Facility.facilityLocationId, Facility.isDeleted` - for facility location with soft delete filtering
- `Facility.organizationId, Facility.facilityTypeId` - for organization-based facility type filtering
- `Facility.organizationId, Facility.facilityLocationId` - for organization-based facility location filtering
- `Reservation.personId, Reservation.status` - for person-based reservation status filtering
- `Reservation.personId, Reservation.paymentStatus` - for person-based payment status filtering
- `Reservation.status, Reservation.paymentStatus` - for reservation and payment status filtering
- `Reservation.reservationDate, Reservation.status` - for date-based reservation status filtering
- `Reservation.checkInDate, Reservation.status` - for check-in date with status filtering
- `Reservation.checkOutDate, Reservation.status` - for check-out date with status filtering
- `Reservation.facilityId, Reservation.status` - for facility-based reservation status filtering
- `Reservation.facilityType, Reservation.status` - for facility type with reservation status filtering
- `MaintenanceRecord.facilityId, MaintenanceRecord.status` - for facility-based maintenance status filtering
- `MaintenanceRecord.facilityId, MaintenanceRecord.date` - for facility-based maintenance date filtering
- `MaintenanceRecord.maintainedById, MaintenanceRecord.status` - for user-based maintenance status filtering
- `MaintenanceRecord.status, MaintenanceRecord.date` - for maintenance status with date filtering
- `MaintenanceRecord.facilityId, MaintenanceRecord.startDate, MaintenanceRecord.endDate` - for facility-based date range filtering
- `HousekeepingRecord.facilityId, HousekeepingRecord.status` - for facility-based housekeeping status filtering
- `HousekeepingRecord.facilityId, HousekeepingRecord.date` - for facility-based housekeeping date filtering
- `HousekeepingRecord.cleanedById, HousekeepingRecord.status` - for user-based housekeeping status filtering
- `HousekeepingRecord.status, HousekeepingRecord.date` - for housekeeping status with date filtering
- `HousekeepingRecord.facilityId, HousekeepingRecord.startDate, HousekeepingRecord.endDate` - for facility-based date range filtering
- `Payment.reservationId, Payment.status` - for reservation-based payment status filtering
- `Payment.method, Payment.status` - for payment method with status filtering
- `Payment.status, Payment.paidAt` - for payment status with paid date filtering
- `Payment.createdAt, Payment.status` - for payment creation with status filtering
- `FacilityType.organizationId, FacilityType.category` - for organization-based category filtering
- `FacilityType.organizationId, FacilityType.isDeleted` - for organization-based soft delete filtering
- `FacilityType.category, FacilityType.isDeleted` - for category-based soft delete filtering
- `FacilityType.organizationId, FacilityType.category, FacilityType.isDeleted` - for organization-based category with soft delete filtering
- `FacilityLocation.organizationId, FacilityLocation.building` - for organization-based building filtering
- `FacilityLocation.organizationId, FacilityLocation.floor` - for organization-based floor filtering
- `FacilityLocation.building, FacilityLocation.floor` - for building and floor combination filtering
- `RateType.organizationId, RateType.isDeleted` - for organization-based soft delete filtering
- `RateType.organizationId, RateType.name` - for organization-based name filtering
- `Organization.code, Organization.isDeleted` - for organization code with soft delete filtering

### 9. Availability and Scheduling Indexes

For reservation and availability queries:

- `Reservation.facilityId, Reservation.status, Reservation.reservationDate, Reservation.reservationEndDate` - for facility availability checking
- `Reservation.facilityType, Reservation.status, Reservation.reservationDate, Reservation.reservationEndDate` - for room type availability checking

## Performance Benefits

### Query Optimization

- **Authentication**: Fast user lookups by email/username
- **Authorization**: Efficient role-based access control
- **Search**: Optimized text-based searches across all entities
- **Filtering**: Fast filtering by status, dates, and business logic
- **Pagination**: Efficient sorting and pagination operations

### Relationship Performance

- **Joins**: Optimized foreign key relationships
- **Aggregations**: Fast counting and grouping operations
- **Complex Queries**: Support for multi-table joins with filtering

### Business Logic Support

- **Availability Checking**: Fast reservation availability queries
- **Status Tracking**: Efficient status-based filtering
- **Audit Trails**: Optimized creation and update date queries
- **Soft Deletes**: Efficient filtering of deleted records

## Index Maintenance

### Monitoring

- Monitor index usage statistics
- Track query performance metrics
- Identify unused or redundant indexes

### Optimization

- Regular index usage analysis
- Remove unused indexes to reduce write overhead
- Add missing indexes based on query patterns

### Best Practices

- Use compound indexes for frequently combined filters
- Order index columns by selectivity (most selective first)
- Consider covering indexes for frequently accessed queries
- Monitor index size and fragmentation

## Migration Strategy

When applying these indexes to an existing database:

1. **Non-blocking**: Most indexes can be created in the background
2. **Gradual**: Apply indexes in batches to minimize impact
3. **Monitoring**: Track performance improvements and any issues
4. **Validation**: Verify index usage and effectiveness

## Query Optimization Guidelines

### For Developers

1. **Use Indexed Fields**: Prefer indexed fields in WHERE clauses
2. **Order Matters**: Use index column order in compound indexes
3. **Avoid Functions**: Don't apply functions to indexed columns
4. **Limit Results**: Use LIMIT for large result sets
5. **Selective Queries**: Use specific filters rather than broad scans

### For Database Administrators

1. **Monitor Performance**: Track query execution times
2. **Analyze Usage**: Review index usage statistics
3. **Optimize Regularly**: Remove unused indexes, add missing ones
4. **Plan Capacity**: Consider index storage requirements
5. **Backup Strategy**: Include indexes in backup and recovery plans

## Conclusion

This comprehensive indexing strategy provides:

- **Fast Query Performance**: Optimized for common query patterns
- **Scalability**: Efficient handling of large datasets
- **Flexibility**: Support for complex filtering and search operations
- **Maintainability**: Clear structure and documentation
- **Future-Proofing**: Extensible for new query patterns

The indexes are designed to support the application's current and future query patterns while maintaining optimal write performance and storage efficiency.
