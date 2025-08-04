# RateType Pricing Model - Option 2: Labels/Tags Only

## 🎯 Overview

RateType now serves as **categorization labels/tags only** and does not contain pricing information. All actual pricing is handled at the FacilityType level. This creates a cleaner separation of concerns where:

- **RateType** = Category/Label (e.g., "Rack Rate", "Corporate Rate", "Promotional")
- **FacilityType** = Actual pricing + facility details
- **Tax & Discount** = Applied via RateType defaults

## 📊 Data Structure

### RateType Fields

```json
{
	"id": "string",
	"name": "string", // Required: "Corporate Rate", "Rack Rate", etc.
	"code": "string", // Optional: "CORP", "RACK", etc.
	"description": "string", // Optional: Explanation of rate type
	"organizationId": "string", // Required: Organization reference
	"defaultTax": "number", // Optional: Default tax % (0-100)
	"defaultDiscount": "number", // Optional: Default discount % (0-100)
	"isDeleted": "boolean", // Soft delete flag
	"createdAt": "datetime",
	"updatedAt": "datetime"
}
```

### FacilityType Fields (Pricing)

```json
{
	"id": "string",
	"name": "string",
	"price": "number", // 💰 ACTUAL PRICE IS HERE
	"rateTypeId": "string", // Links to RateType for categorization
	"category": "enum",
	"details": "json"
	// ... other facility fields
}
```

## 🔄 Pricing Workflow

### Step 1: Create RateType (Label Only)

```json
POST /api/rateTypes
{
  "name": "Corporate Rate",
  "code": "CORP",
  "description": "Negotiated rate for corporate clients",
  "organizationId": "68412c97c0c093fb4f0b0a11",
  "defaultTax": 8.0,
  "defaultDiscount": 15.0
}
```

### Step 2: Create FacilityType (With Actual Price)

```json
POST /api/facilityTypes
{
  "name": "Deluxe Suite",
  "price": 200.00,              // 💰 Real price here
  "rateTypeId": "rate_type_id", // Links to "Corporate Rate"
  "category": "HOTEL",
  "organizationId": "68412c97c0c093fb4f0b0a11"
}
```

### Step 3: Price Calculation

```javascript
// Final price calculation
const basePrice = facilityType.price; // 200.00
const tax = basePrice * (rateType.defaultTax / 100); // 200 * 8% = 16.00
const discount = basePrice * (rateType.defaultDiscount / 100); // 200 * 15% = 30.00

const finalPrice = basePrice + tax - discount; // 200 + 16 - 30 = 186.00
```

## 💡 Benefits

### ✅ Advantages

- **Clear separation of concerns**: Price vs categorization
- **Simplified rate management**: One price per facility type
- **Flexible categorization**: Rate types are just labels
- **Consistent pricing**: All facilities of same type have same base price
- **Easy tax/discount management**: Centralized at rate type level

### 🎯 Use Cases

- **Hotels**: Different rate categories (Rack, Corporate, Government) applied to room types
- **Conference Centers**: Standard vs Non-profit vs Educational rates
- **Gyms**: Member vs Guest vs Student rates
- **Any scenario** where pricing is per facility but discounts/taxes vary by customer type

## 📋 Common Rate Types

### Hotel Industry

```json
[
	{ "name": "Rack Rate", "code": "RACK", "defaultDiscount": 0 },
	{ "name": "Corporate Rate", "code": "CORP", "defaultDiscount": 15 },
	{ "name": "Government Rate", "code": "GOV", "defaultDiscount": 25 },
	{ "name": "AAA Rate", "code": "AAA", "defaultDiscount": 10 }
]
```

### Conference Centers

```json
[
	{ "name": "Standard Rate", "code": "STD", "defaultDiscount": 0 },
	{ "name": "Non-Profit Rate", "code": "NONPROFIT", "defaultDiscount": 20 },
	{ "name": "Educational Rate", "code": "EDU", "defaultDiscount": 30 }
]
```

## 🔄 Migration Notes

If migrating from a price-in-rateType model:

1. **Remove** `price` and `unit` fields from RateType schema
2. **Move** pricing logic to FacilityType level
3. **Update** validation schemas to remove price fields
4. **Adjust** API controllers to handle pricing at FacilityType level
5. **Update** frontend to fetch prices from FacilityType, not RateType

## 📝 API Examples

See `sample-rate-types.json` for comprehensive examples of:

- Creating rate types as labels
- Updating rate types
- Common rate type patterns by industry
- Complete pricing workflow examples

## 🔍 Related Files

- `prisma/schema/rateType.prisma` - Updated schema without price
- `prisma/schema/facilityType.prisma` - Contains actual pricing
- `zod/rateType.zod.ts` - Updated validation without price fields
- `sample-rate-types.json` - Complete examples and documentation
