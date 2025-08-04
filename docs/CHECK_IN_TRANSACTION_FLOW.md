# Check-in Transaction Flow

## Overview

The check-in process now automatically creates transaction records when guests check in, capturing the payment received at the front desk.

## Flow Steps

### 1. Reservation Creation (Before Check-in)

- Front desk gathers guest information (name, contact details)
- Room type and dates are selected
- System calculates `totalAmount = nightlyRate * nights + taxes/fees`
- Creates a Reservation record with status: `RESERVED` or `PENDING`
- No transaction is created at this stage

### 2. Check-in Process (Guest Arrival)

When front desk clicks "Check-in" for a reservation:

1. **Room Assignment**:

    - Automatically assigns an available room (if `autoAssign: true`)
    - Or manually assigns a specific room (if `facilityId` provided)

2. **Status Update**:

    - Updates `reservation.status = "CHECKED_IN"`
    - Sets `checkInDate` (current time or custom date)

3. **Transaction Creation**:
    - **Automatically creates a Transaction record** when `totalAmount > 0`
    - Transaction details:
        - `type: "CASH_IN"` (money coming into the system)
        - `status: "COMPLETED"` (payment received immediately)
        - `amount: reservation.totalAmount`
        - `provider: paymentProvider || "CASH"`
        - `providerRef: "CHECKIN-{reservationId}-{timestamp}"`
        - `metadata`: Contains reservation details and payment method

## API Enhancement

### Endpoint: `PATCH /api/reservation/:id/assign-room`

#### Enhanced Request Parameters:

**Basic Check-in:**

```json
{
	"autoAssign": true,
	"facilityId": "room123",
	"checkInDate": "2024-01-15T14:00:00Z",
	"checkOutDate": "2024-01-18T11:00:00Z",
	"paymentProvider": "CREDIT_CARD"
}
```

**Advanced Check-in with Custom Transaction:**

```json
{
	"autoAssign": true,
	"checkInDate": "2024-01-15T14:00:00Z",
	"checkOutDate": "2024-01-18T11:00:00Z",
	"paymentProvider": "CREDIT_CARD",
	"transaction": {
		"type": "PAYMENT",
		"amount": 5000.0,
		"currency": "PHP",
		"status": "COMPLETED",
		"provider": "STRIPE",
		"providerRef": "STRIPE-TXN-12345",
		"metadata": {
			"cardLast4": "1234",
			"authCode": "ABC123",
			"merchantId": "STRIPE_001",
			"paymentMethod": "CREDIT_CARD",
			"description": "Payment for deluxe room",
			"notes": "Paid via mobile app",
			"customerEmail": "guest@example.com"
		}
	}
}
```

#### Transaction Field Options:

| Field         | Type   | Default                       | Options                                           |
| ------------- | ------ | ----------------------------- | ------------------------------------------------- |
| `type`        | string | `"PAYMENT"`                   | `PAYMENT`, `CASH_IN`, `CASH_OUT`, `REIMBURSEMENT` |
| `amount`      | number | `reservation.totalAmount`     | Any positive number                               |
| `currency`    | string | `"PHP"`                       | Any 3-letter currency code                        |
| `status`      | string | `"COMPLETED"`                 | `PENDING`, `COMPLETED`, `FAILED`, `CANCELLED`     |
| `provider`    | string | Mapped from `paymentProvider` | `CASH`, `STRIPE`, `GCASH`, etc.                   |
| `providerRef` | string | Auto-generated                | Custom reference ID                               |
| `metadata`    | object | `{}`                          | Any custom key-value pairs                        |

#### 📝 **Understanding Transaction Fields:**

**Key Difference:**

- `type` = **Transaction Category** (what kind of transaction this is)
- `provider` = **Payment Processor** (how the payment was processed)
- `metadata.paymentMethod` = **Customer Payment Method** (what the customer used)

**Transaction Types:**

- `PAYMENT` ✅ - Customer payment (recommended for check-ins)
- `CASH_IN` - Generic money coming in (legacy/confusing for card payments)
- `CASH_OUT` - Money going out (refunds, etc.)
- `REIMBURSEMENT` - Refunds to customers

**Example:**

```json
{
	"type": "PAYMENT", // ← Transaction category
	"provider": "STRIPE", // ← Payment processor
	"metadata": {
		"paymentMethod": "CREDIT_CARD" // ← What customer used
	}
}
```

#### Example API Calls:

**1. Simple Cash Payment:**

```json
{
	"autoAssign": true,
	"paymentProvider": "CASH"
}
```

**2. Credit Card with Custom Amount:**

```json
{
	"autoAssign": false,
	"facilityId": "67a1b2c3d4e5f6789012345",
	"paymentProvider": "CREDIT_CARD",
	"transaction": {
		"amount": 4500.0,
		"metadata": {
			"cardLast4": "9876",
			"authCode": "XYZ789",
			"discount": "Early bird discount applied"
		}
	}
}
```

**3. Pending Payment (Pay Later):**

```json
{
	"autoAssign": true,
	"checkInDate": "2024-01-15T15:30:00Z",
	"transaction": {
		"status": "PENDING",
		"metadata": {
			"paymentDue": "2024-01-16T12:00:00Z",
			"description": "Payment pending - will settle tomorrow"
		}
	}
}
```

**4. GCash Payment with Receipt:**

```json
{
	"autoAssign": true,
	"paymentProvider": "GCASH",
	"transaction": {
		"providerRef": "GCASH-REF-ABC123456",
		"metadata": {
			"gcashNumber": "+639123456789",
			"receiptNumber": "GC789012345",
			"description": "Paid via GCash mobile wallet"
		}
	}
}
```

**5. Partial Payment:**

```json
{
	"autoAssign": true,
	"transaction": {
		"amount": 2500.0,
		"status": "COMPLETED",
		"metadata": {
			"originalAmount": 5000.0,
			"remainingBalance": 2500.0,
			"description": "Partial payment - balance due on checkout"
		}
	}
}
```

#### Supported Payment Methods:

- `CASH` (default) → maps to CASH
- `CREDIT_CARD` → maps to STRIPE
- `DEBIT_CARD` → maps to STRIPE
- `GCASH` → maps to GCASH
- `PAYPAL` → maps to PAYPAL
- `STRIPE` → maps to STRIPE
- `DRAGONPAY` → maps to DRAGONPAY
- `PAYMONGO` → maps to PAYMONGO
- `BANK_TRANSFER` → maps to BANK_TRANSFER
- `CARD` → maps to STRIPE
- `ONLINE` → maps to STRIPE

**Note**: User-friendly payment methods are automatically mapped to valid database PaymentProvider enum values.

#### Response:

```json
{
	"message": "Room auto-assigned and guest checked in successfully",
	"reservation": {
		"id": "reservation123",
		"facilityId": "room456",
		"status": "CHECKED_IN",
		"totalAmount": 5000.0,
		"user": {
			"id": "user123",
			"userName": "john_doe",
			"email": "john@example.com"
		},
		"facility": {
			"id": "room456",
			"name": "Deluxe Room 201",
			"facilityType": {
				"name": "Deluxe",
				"price": 5000.0
			}
		},
		"transactions": [
			{
				"id": "transaction456",
				"type": "PAYMENT",
				"amount": 5000.0,
				"currency": "PHP",
				"status": "COMPLETED",
				"provider": "STRIPE",
				"providerRef": "CHECKIN-reservation123-1704384000000",
				"metadata": {
					"facilityId": "room456",
					"checkInDate": "2024-01-15T14:00:00.000Z",
					"paymentMethod": "CREDIT_CARD",
					"actualProvider": "STRIPE",
					"description": "Payment received during check-in"
				},
				"createdAt": "2024-01-15T14:00:00.000Z"
			}
		]
	},
	"assignedFacilityId": "room123",
	"alreadyAssigned": false
}
```

## Transaction Record Created

When a guest checks in, a transaction is automatically created with:

```json
{
	"id": "transaction_id",
	"userId": "guest_user_id",
	"reservationId": "reservation123",
	"type": "PAYMENT",
	"amount": 5000.0,
	"currency": "PHP",
	"status": "COMPLETED",
	"provider": "CASH",
	"providerRef": "CHECKIN-reservation123-1704384000000",
	"metadata": {
		"facilityId": "room456",
		"checkInDate": "2024-01-15T14:00:00.000Z",
		"paymentMethod": "CASH",
		"actualProvider": "CASH",
		"description": "Payment received during check-in"
	},
	"reservation": {
		"id": "reservation123",
		"facilityId": "room456",
		"status": "CHECKED_IN"
	},
	"user": {
		"id": "guest_user_id",
		"userName": "john_doe"
	},
	"createdAt": "2024-01-15T14:00:00.000Z"
}
```

### **New Database Relationship:**

- `Transaction` now has a **direct foreign key relationship** to `Reservation`
- `reservationId` field creates a proper database link (not just metadata)
- Supports querying transactions by reservation: `GET /api/transaction?reservationId=123`
- Includes full reservation and user data in transaction responses

### **Enhanced Reservation API Responses:**

**All reservation endpoints now include related transactions:**

- `GET /api/reservation` - includes transactions array for all reservations
- `GET /api/reservation/:id` - includes transactions array
- `PATCH /api/reservation/:id` - includes transactions after update
- `PATCH /api/reservation/:id/status` - includes transactions after status change
- `PATCH /api/reservation/:id/assign-room` - includes transactions after check-in

**Transactions are ordered by `createdAt DESC` (newest first)**

## Benefits

1. **Automatic Financial Tracking**: Every check-in payment is automatically recorded
2. **Audit Trail**: Complete payment history linked to reservations
3. **Flexible Payment Methods**: Support for various payment providers
4. **Integration Ready**: Transaction records can be used for accounting and reporting
5. **Consistent Data**: No manual transaction creation needed

## Notes

- Transactions are only created when `reservation.totalAmount > 0`
- Both auto-assigned and manually assigned rooms trigger transaction creation
- All transaction creation happens within the same database transaction as the check-in
- If transaction creation fails, the entire check-in process is rolled back
- Transaction `providerRef` is unique per check-in to prevent duplicates

## Database Migration Required

To implement the new relationship, run:

```bash
npx prisma db push
# or
npx prisma migrate dev --name add-transaction-reservation-relation
```

This will:

1. Add `reservationId` field to Transaction model
2. Create foreign key constraint: `Transaction.reservationId` → `Reservation.id`
3. Add database index on `reservationId` for query performance
4. Set `onDelete: SetNull` (if reservation is deleted, transaction remains but link is removed)
