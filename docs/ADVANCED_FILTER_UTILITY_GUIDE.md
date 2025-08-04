# Advanced Filter Utility Guide

## Overview

The Advanced Filter Utility provides a powerful, reusable filtering system for all getAll endpoints in your application. It replaces manual filtering logic with an intelligent, configurable system that handles nested relations, different field types, and complex queries automatically.

## Features

- ✅ **Automatic Nested Relation Filtering**: Filter by any relation depth (e.g., `user.person.firstName`, `facility.organization.name`)
- ✅ **Intelligent Field Type Handling**: Automatically applies appropriate filtering logic based on field types
- ✅ **Configurable**: Customize field types and behaviors for any model
- ✅ **Reusable**: Same code works across all controllers
- ✅ **Backward Compatible**: All existing queries continue to work
- ✅ **Type Safe**: Full TypeScript support with Prisma types

## Quick Start

### 1. Import the Utilities

```typescript
import {
	handleQueryValidation,
	buildFieldSelections,
	buildOrderBy,
	createPaginatedResponse,
} from "../../utils/queryUtils";
import {
	buildAdvancedWhereClause,
	getSearchFields,
	createFilterOptions,
} from "../../utils/advancedFilterUtils";
```

### 2. Replace Your getAll Method

```typescript
const getAll = async (req: Request, res: Response, _next: NextFunction) => {
	// Use centralized query validation
	const parsedParams = handleQueryValidation(req, res, logger);
	if (!parsedParams) return;

	const { page, limit, skip, sort, fields, query, filter, order } = parsedParams;

	try {
		// Define base conditions
		const baseConditions = { isDeleted: false };

		// Auto-generate search fields
		const searchFields = getSearchFields("modelName", ["relation1", "relation2"]);

		// Build advanced where clause
		const whereClause = buildAdvancedWhereClause(
			baseConditions,
			"modelName",
			query,
			searchFields,
			filter,
		);

		// Rest of your Prisma query logic remains the same...
	} catch (error) {
		// Error handling
	}
};
```

## Field Type Configuration

The utility automatically handles different field types with appropriate filtering logic:

### Text Fields

- Use case-insensitive `contains` filtering
- Example: `name`, `description`, `email`

### Exact Match Fields

- Use exact equality matching
- Example: `id`, `status`, `category`, `isDeleted`

### Date Fields

- Support range queries with `gte`, `lte`, etc.
- Example: `createdAt`, `updatedAt`, `dateOfBirth`

### Array Fields

- Use `hasSome` for array values, `has` for single values
- Example: `permissions`, `amenities`, `imageUrl`

### Boolean Fields

- Parse string values ("true"/"false") to boolean
- Example: `isDeleted`, `isActive`, `isTimeBased`

### Number Fields

- Support range queries with `gte`, `lte`, etc.
- Example: `price`, `capacity`, `maxOccupancy`

### JSON Fields

- Handle JSON/composite types
- Example: `metadata`, `personalInfo`, `contactInfo`

## Pre-configured Models

The utility comes with pre-configured field types for common models:

- **facility**: name, description, facilityType relations, etc.
- **facilityType**: name, code, price, amenities, etc.
- **user**: userName, email, person relations, etc.
- **person**: firstName, lastName, personalInfo composite types
- **organization**: name, description, address
- **reservation**: status, dates, notes
- **role**: name, description, permissions
- **transaction**: type, status, amount, dates

## Usage Examples

### Basic Model Filtering

```typescript
// For facilities
const searchFields = getSearchFields("facility", ["facilityType", "organization", "facilityLocations"]);
const whereClause = buildAdvancedWhereClause(
	baseConditions,
	"facility",
	query,
	searchFields,
	filter,
);

// For users
const searchFields = getSearchFields("user", ["person", "organization", "role"]);
const whereClause = buildAdvancedWhereClause(baseConditions, "user", query, searchFields, filter);

// For reservations
const searchFields = getSearchFields("reservation", ["facility", "user"]);
const whereClause = buildAdvancedWhereClause(
	baseConditions,
	"reservation",
	query,
	searchFields,
	filter,
);
```

### Custom Field Configuration

```typescript
const customOptions = createFilterOptions(
	{
		// Override default configurations
		customModel: {
			exactMatchFields: ["id", "status", "type"],
			textSearchFields: ["name", "title", "notes"],
			dateFields: ["createdAt", "updatedAt", "eventDate"],
			arrayFields: ["tags", "categories"],
			booleanFields: ["isActive", "isVisible"],
			numberFields: ["price", "quantity"],
			jsonFields: ["settings", "metadata"],
		},
	},
	{
		// Add custom relation configurations
		customRelation: { type: "many-to-one", model: "customModel" },
	},
);

const whereClause = buildAdvancedWhereClause(
	baseConditions,
	"mainModel",
	query,
	searchFields,
	filter,
	customOptions, // Pass custom options
);
```

## API Filter Examples

### Simple Relation Filtering

```bash
# Filter facilities by facility type name
GET /facilities?filter=[{"facilityType.name": "Standard Room"}]

# Filter users by person's first name
GET /users?filter=[{"person.firstName": "John"}]

# Filter reservations by facility name
GET /reservations?filter=[{"facility.name": "Room 101"}]
```

### Multiple Conditions

```bash
# Multiple filters in same object (AND logic)
GET /facilities?filter=[{"facilityType.name": "Standard Room", "organization.name": "Hotel Chain"}]

# Multiple filter objects (OR logic between objects, AND within objects)
GET /users?filter=[{"person.firstName": "John"}, {"person.firstName": "Jane"}]
```

### Range Queries

```bash
# Date ranges
GET /reservations?filter=[{"createdAt": {"gte": "2024-01-01", "lte": "2024-12-31"}}]

# Number ranges
GET /facilities?filter=[{"facilityType.price": {"gte": 100, "lte": 500}}]

# Age ranges in composite types
GET /users?filter=[{"person.personalInfo.age": {"gte": 18, "lte": 65}}]
```

### Deep Nested Filtering

```bash
# Filter by nested composite types
GET /users?filter=[{"person.personalInfo.address.city": "New York"}]

# Filter by deeply nested relations
GET /reservations?filter=[{"facility.organization.name": "Hotel Group"}]
```

### Array Filtering

```bash
# Filter by array containing any of the values
GET /facilities?filter=[{"facilityType.amenities": ["WiFi", "AC"]}]

# Filter by array containing specific value
GET /users?filter=[{"role.permissions": "admin"}]
```

### Combined with Search

```bash
# Combine text search with filtering
GET /facilities?query=hotel&filter=[{"facilityType.category": "ROOM"}]
```

## Migration Guide

### From Old Approach

```typescript
// OLD ❌
const whereClause: Prisma.ModelWhereInput = {};

if (query) {
	whereClause.OR = [
		{ name: { contains: String(query) } },
		{ description: { contains: String(query) } },
	];
}

if (filter) {
	const filterConditions = buildFilterConditions(JSON.parse(filter));
	if (filterConditions.length > 0) {
		whereClause.AND = filterConditions;
	}
}
```

```typescript
// NEW ✅
const baseConditions = { isDeleted: false };
const searchFields = getSearchFields("modelName", ["relation1", "relation2"]);
const whereClause = buildAdvancedWhereClause(
	baseConditions,
	"modelName",
	query,
	searchFields,
	filter,
);
```

### Benefits of Migration

1. **Reduced Code**: 20+ lines becomes 4 lines
2. **More Features**: Automatic nested filtering, intelligent field types
3. **Better Maintainability**: Centralized configuration
4. **Consistent Behavior**: Same filtering logic across all endpoints
5. **Type Safety**: Full TypeScript support

## Controller Templates

### Standard getAll Template

```typescript
const getAll = async (req: Request, res: Response, _next: NextFunction) => {
	const parsedParams = handleQueryValidation(req, res, logger);
	if (!parsedParams) return;

	const { page, limit, skip, sort, fields, query, filter, order } = parsedParams;

	try {
		const baseConditions: Prisma.ModelWhereInput = { isDeleted: false };
		const searchFields = getSearchFields("modelName", ["relation1", "relation2"]);
		const whereClause = buildAdvancedWhereClause(
			baseConditions,
			"modelName",
			query,
			searchFields,
			filter,
		);

		const findManyQuery: Prisma.ModelFindManyArgs = {
			where: whereClause,
			skip,
			take: limit,
			orderBy: buildOrderBy(sort, order),
		};

		if (fields) {
			findManyQuery.select = buildFieldSelections(fields);
		} else {
			findManyQuery.include = {
				relation1: true,
				relation2: true,
			};
		}

		const [items, total] = await Promise.all([
			prisma.model.findMany(findManyQuery),
			prisma.model.count({ where: whereClause }),
		]);

		const response = createPaginatedResponse(items, total, page, limit, "items");
		res.status(200).json({
			status: "success",
			message: "Items retrieved successfully",
			data: response,
		});
	} catch (error: any) {
		logger.error(`Error getting items: ${error}`);
		res.status(500).json({ error: "Internal server error" });
	}
};
```

## Best Practices

1. **Use Descriptive Relation Names**: Include all relations you want to be filterable
2. **Configure Field Types**: Customize field configurations for domain-specific needs
3. **Handle Include/Select**: Always provide both field selection and default includes
4. **Error Handling**: Use consistent error handling patterns
5. **Logging**: Include relevant filter information in logs
6. **Performance**: Consider database indexes for commonly filtered fields

## Troubleshooting

### Common Issues

1. **Relation Not Found**: Ensure relation is configured in `DEFAULT_RELATION_CONFIGS`
2. **Wrong Filter Type**: Check field type configuration for the model
3. **Performance Issues**: Add database indexes for filtered fields
4. **TypeScript Errors**: Ensure Prisma types are up to date

### Debug Tips

1. **Log Generated Queries**: Add `console.log(whereClause)` to see generated conditions
2. **Check Configuration**: Verify model and relation configurations
3. **Test Simple Cases**: Start with basic filters before complex nested ones

## Extending the Utility

### Adding New Models

```typescript
// Add to DEFAULT_MODEL_CONFIGS
newModel: {
	exactMatchFields: ['id', 'status'],
	textSearchFields: ['name', 'description'],
	dateFields: ['createdAt', 'updatedAt'],
	arrayFields: ['tags'],
	booleanFields: ['isActive'],
	numberFields: ['price'],
	jsonFields: ['metadata']
}
```

### Adding New Relations

```typescript
// Add to DEFAULT_RELATION_CONFIGS
newRelation: { type: 'many-to-one', model: 'targetModel' }
```

This utility provides a powerful, flexible foundation for filtering across your entire application while maintaining consistency and reducing code duplication.
