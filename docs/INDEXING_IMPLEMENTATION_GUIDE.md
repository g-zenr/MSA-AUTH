# Database Indexing Implementation Guide

This guide provides practical instructions for implementing and using the comprehensive database indexing strategy in the LMS API.

## Quick Start

### 1. Apply Database Indexes

```bash
# Apply all indexes
npm run apply-indexes apply

# Validate existing indexes
npm run apply-indexes validate

# Apply and validate indexes
npm run apply-indexes apply-and-validate
```

### 2. Generate Prisma Client

After applying indexes, regenerate the Prisma client:

```bash
npm run prisma-generate
```

## Index Implementation Details

### Applied Indexes by Model

#### User Model

- **Authentication**: `email`, `userName` (unique constraints)
- **Role-based Access**: `role`, `status`, `organizationId`
- **Activity Tracking**: `lastLogin`, `createdAt`
- **Soft Delete**: `isDeleted`
- **Composite**: `role + status`, `organizationId + status`, `organizationId + role`

#### Person Model

- **Search**: `personalInfo.firstName`, `personalInfo.lastName`, `contactInfo.email`
- **Demographics**: `personalInfo.gender`, `personalInfo.nationality`
- **Identification**: `identification.type`, `identification.number`
- **Organization**: `organizationId`
- **Status**: `metadata.status`, `metadata.isActive`, `metadata.isDeleted`
- **Activity**: `metadata.lastLoginAt`

#### Facility Model

- **Search**: `name`
- **Classification**: `facilityTypeId`, `facilityLocationId`
- **Organization**: `organizationId`
- **Features**: `isTimeBased`, `isDeleted`
- **Composite**: `organizationId + isDeleted`, `facilityTypeId + isDeleted`

#### Reservation Model

- **Core**: `personId`, `facilityId`, `status`, `paymentStatus`
- **Dates**: `reservationDate`, `reservationEndDate`, `checkInDate`, `checkOutDate`
- **Business Logic**: `facilityType`, `marketCode`, `sourceCode`, `bookingChannel`
- **Availability**: `facilityId + status + reservationDate + reservationEndDate`
- **Composite**: `personId + status`, `status + paymentStatus`, `facilityId + status`

#### Transaction Model

- **Core**: `personId`, `reservationId`, `type`, `status`, `provider`
- **Financial**: `amount`, `currency`
- **Temporal**: `createdAt`

#### Payment Model

- **Core**: `reservationId`, `method`, `status`, `amount`
- **Temporal**: `paidAt`, `createdAt`
- **External**: `transactionId`
- **Composite**: `reservationId + status`, `method + status`

#### MaintenanceRecord Model

- **Core**: `facilityId`, `maintainedById`, `status`, `date`
- **Scheduling**: `startDate`, `endDate`
- **Composite**: `facilityId + status`, `facilityId + date`, `status + date`

#### HousekeepingRecord Model

- **Core**: `facilityId`, `cleanedById`, `status`, `date`
- **Scheduling**: `startDate`, `endDate`
- **Composite**: `facilityId + status`, `facilityId + date`, `status + date`

#### Organization Model

- **Search**: `name`, `code`
- **Status**: `isDeleted`
- **Temporal**: `createdAt`

#### FacilityType Model

- **Search**: `name`, `code`
- **Classification**: `category`, `organizationId`
- **Pricing**: `rateTypeId`, `price`
- **Status**: `isDeleted`
- **Composite**: `organizationId + category`, `category + isDeleted`

#### FacilityLocation Model

- **Location**: `building`, `floor`, `nearby`
- **Organization**: `organizationId`
- **Composite**: `organizationId + building`, `building + floor`

#### RateType Model

- **Search**: `name`, `code`
- **Organization**: `organizationId`
- **Status**: `isDeleted`
- **Composite**: `organizationId + isDeleted`, `organizationId + name`

## Performance Optimization

### Query Patterns Optimized

#### Authentication & Authorization

```typescript
// Fast user lookups
const user = await prisma.user.findUnique({
	where: { email: "user@example.com" },
});

// Role-based filtering
const admins = await prisma.user.findMany({
	where: { role: "admin", status: "active" },
});
```

#### Search Operations

```typescript
// Person search
const people = await prisma.person.findMany({
	where: {
		OR: [
			{ personalInfo: { firstName: { contains: "John" } } },
			{ personalInfo: { lastName: { contains: "Doe" } } },
			{ contactInfo: { email: { contains: "john@example.com" } } },
		],
	},
});
```

#### Availability Queries

```typescript
// Facility availability
const availableFacilities = await prisma.reservation.findMany({
	where: {
		facilityId: "facility-id",
		status: { in: ["RESERVED", "CHECKED_IN"] },
		OR: [
			{
				reservationDate: { lte: checkInDate },
				reservationEndDate: { gte: checkOutDate },
			},
			{
				reservationDate: { lte: checkInDate },
				reservationEndDate: { gte: checkInDate },
			},
		],
	},
});
```

#### Status-based Filtering

```typescript
// Active reservations
const activeReservations = await prisma.reservation.findMany({
	where: {
		status: { in: ["RESERVED", "CHECKED_IN"] },
		paymentStatus: { in: ["PAID", "PARTIALLY_PAID"] },
	},
});
```

#### Date Range Queries

```typescript
// Reservations in date range
const reservations = await prisma.reservation.findMany({
	where: {
		reservationDate: { gte: startDate, lte: endDate },
		status: { not: "CANCELLED" },
	},
});
```

### Performance Monitoring

#### Index Usage Statistics

```typescript
// Check index usage (MongoDB)
db.getCollection("User").getIndexes();
db.getCollection("Reservation").getIndexes();

// Analyze query performance
db.getCollection("User").explain().find({ role: "admin" });
```

#### Query Performance Metrics

- **Execution Time**: Monitor query response times
- **Index Hit Rate**: Track index usage vs collection scans
- **Memory Usage**: Monitor index memory consumption
- **Write Performance**: Track impact on insert/update operations

## Best Practices

### For Developers

#### 1. Use Indexed Fields in WHERE Clauses

```typescript
// ✅ Good - uses indexed field
const users = await prisma.user.findMany({
	where: { role: "admin", status: "active" },
});

// ❌ Avoid - non-indexed field
const users = await prisma.user.findMany({
	where: {
		metadata: { path: ["customField"], equals: "value" },
	},
});
```

#### 2. Leverage Compound Indexes

```typescript
// ✅ Good - uses compound index order
const reservations = await prisma.reservation.findMany({
	where: {
		facilityId: "facility-id",
		status: "RESERVED",
		reservationDate: { gte: new Date() },
	},
});
```

#### 3. Avoid Functions on Indexed Fields

```typescript
// ❌ Avoid - function on indexed field
const users = await prisma.user.findMany({
	where: {
		email: { contains: "test" }, // This is fine
	},
});

// ❌ Avoid - date functions on indexed date fields
const reservations = await prisma.reservation.findMany({
	where: {
		reservationDate: {
			gte: new Date("2024-01-01"),
			lte: new Date("2024-12-31"),
		},
	},
});
```

#### 4. Use Selective Filters

```typescript
// ✅ Good - selective filters
const activeUsers = await prisma.user.findMany({
	where: {
		status: "active",
		organizationId: "org-id",
	},
});

// ❌ Avoid - broad scans
const allUsers = await prisma.user.findMany({
	where: {
		isDeleted: false, // Too broad without additional filters
	},
});
```

### For Database Administrators

#### 1. Monitor Index Usage

```bash
# Check index statistics
db.getCollection('User').aggregate([
  { $indexStats: {} }
])

# Analyze slow queries
db.getCollection('User').explain('executionStats').find({})
```

#### 2. Regular Maintenance

```bash
# Rebuild indexes if needed
db.getCollection('User').reIndex()

# Check index fragmentation
db.getCollection('User').stats().indexSizes
```

#### 3. Performance Tuning

- Monitor query execution plans
- Identify missing indexes
- Remove unused indexes
- Optimize index column order

## Troubleshooting

### Common Issues

#### 1. Slow Queries

**Symptoms**: Queries taking longer than expected
**Solutions**:

- Check if indexes exist for query fields
- Verify index column order matches query
- Analyze query execution plan
- Consider adding missing indexes

#### 2. High Memory Usage

**Symptoms**: High memory consumption by indexes
**Solutions**:

- Monitor index sizes
- Remove unused indexes
- Consider partial indexes for large collections
- Optimize index column selection

#### 3. Write Performance Impact

**Symptoms**: Slow insert/update operations
**Solutions**:

- Review index overhead
- Consider background index creation
- Optimize index column order
- Remove redundant indexes

### Debugging Tools

#### 1. Query Analysis

```typescript
// Enable query logging
const prisma = new PrismaClient({
	log: ["query", "info", "warn", "error"],
});
```

#### 2. Performance Monitoring

```typescript
// Measure query performance
const start = Date.now();
const result = await prisma.user.findMany({ where: { role: "admin" } });
const duration = Date.now() - start;
console.log(`Query took ${duration}ms`);
```

#### 3. Index Validation

```bash
# Validate index existence
npm run apply-indexes validate

# Check specific collection indexes
db.getCollection('User').getIndexes()
```

## Migration Strategy

### For Existing Databases

1. **Backup First**: Always backup before applying indexes
2. **Test Environment**: Apply indexes in test environment first
3. **Gradual Application**: Apply indexes in batches
4. **Monitor Performance**: Track before/after performance metrics
5. **Rollback Plan**: Have rollback strategy ready

### For New Deployments

1. **Include in Schema**: Add indexes to Prisma schema
2. **Automated Deployment**: Include index creation in deployment scripts
3. **Validation**: Verify indexes after deployment
4. **Documentation**: Update documentation with index information

## Conclusion

This comprehensive indexing strategy provides:

- **Fast Query Performance**: Optimized for common patterns
- **Scalability**: Efficient handling of large datasets
- **Maintainability**: Clear structure and documentation
- **Flexibility**: Support for complex business logic
- **Future-Proofing**: Extensible for new requirements

The indexes are designed to support the application's current and future query patterns while maintaining optimal write performance and storage efficiency.

For questions or issues with the indexing implementation, refer to the main documentation or contact the development team.
