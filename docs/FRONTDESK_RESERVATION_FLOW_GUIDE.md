# Frontdesk Reservation Flow Guide

This guide demonstrates the complete step-by-step reservation flow from the frontdesk/admin perspective.

## ✅ 1. Reservation Flow Overview

### 📥 Step-by-step Process:

#### **Step 1: Select Facility**

Frontdesk selects available facility (e.g., hotel room, gym court, conference room)

#### **Step 2: Enter Guest Information**

Guest name, contact info (or select existing guest if already in DB)

#### **Step 3: Choose Booking Schedule**

Date/time range based on facility's bookingMode (BY_HOUR, BY_DATE, or FLEXIBLE)

#### **Step 4: Choose Rate Type**

E.g. "Per Hour", "Per Night", "Corporate Discount", etc.

#### **Step 5: System Calculates Price**

The system automatically calculates pricing based on rate type, duration, and taxes/discounts

#### **Step 6: Confirm + Save Reservation**

Store full record with calculated pricing

## 💰 Rate Type-Based Pricing

### Enhanced RateType Model

```prisma
model RateType {
  id              String         @id @default(auto()) @map("_id") @db.ObjectId
  name            String         // e.g. "Per Hour", "Per Night", "Promo"
  code            String?
  price           Float?         // Base price for this rate type
  unit            String?        // "hour", "night", "day", "week", etc.
  organization    Organization   @relation(fields: [organizationId], references: [id])
  organizationId  String         @db.ObjectId
  defaultTax      Float?         // Tax percentage
  defaultDiscount Float?         // Discount percentage
  facilityTypes   FacilityType[]
  reservations    Reservation[]
  isDeleted       Boolean        @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

### 🧠 Why Store Price and TotalAmount in Reservation?

**Benefits:**

- **Rate Lock-in**: Rates can change later, but booking price is locked at time of reservation
- **Audit Trail**: Show historical pricing for reports and reconciliation
- **Offline Operations**: No backend calculation needed at runtime
- **Performance**: No need to recalculate pricing for historical data

## 📝 API Example

### Create Reservation with Rate Type

```bash
POST /api/reservation
Content-Type: application/json

{
  "facilityType": "BASKETBALL_COURT",
  "rateTypeId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "reservationDate": "2024-01-15T14:00:00Z",
  "reservationEndDate": "2024-01-15T16:00:00Z",
  "guests": 4,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

### Response with Calculated Pricing

```json
{
	"id": "65a1b2c3d4e5f6789abcdef0",
	"facilityType": "BASKETBALL_COURT",
	"totalAmount": 54.25,
	"appliedTax": 8.5,
	"appliedDiscount": 0,
	"rateType": {
		"id": "60f7b3b3b3b3b3b3b3b3b3b3",
		"name": "Per Hour Basketball"
	}
}
```

This system provides flexible, audit-friendly pricing that can handle various business models.
