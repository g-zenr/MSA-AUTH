const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function addReservationConstraints() {
	try {
		console.log("Adding database constraints to prevent overlapping reservations...");

		// Note: MongoDB doesn't support traditional SQL constraints like PostgreSQL/MySQL
		// Instead, we'll create compound indexes that will help with performance
		// and can be used by application logic to enforce uniqueness

		console.log("Creating indexes for reservation constraints...");

		// Create a compound index on facilityId, reservationDate, reservationEndDate, and status
		// This will help with performance and can be used to enforce uniqueness
		await prisma.$executeRaw`
      db.reservations.createIndex(
        { 
          "facilityId": 1, 
          "reservationDate": 1, 
          "reservationEndDate": 1, 
          "status": 1 
        }, 
        { 
          unique: true,
          name: "unique_facility_reservation_dates",
          partialFilterExpression: {
            "facilityId": { $ne: null },
            "status": { $nin: ["CANCELLED", "CHECKED_OUT"] }
          }
        }
      )
    `;

		// Create an index for room type availability queries
		await prisma.$executeRaw`
      db.reservations.createIndex(
        { 
          "facilityType": 1, 
          "status": 1, 
          "reservationDate": 1, 
          "reservationEndDate": 1 
        }, 
        { 
          name: "idx_room_type_availability"
        }
      )
    `;

		// Create an index for facility availability queries
		await prisma.$executeRaw`
      db.reservations.createIndex(
        { 
          "facilityId": 1, 
          "status": 1, 
          "reservationDate": 1, 
          "reservationEndDate": 1 
        }, 
        { 
          name: "idx_facility_availability"
        }
      )
    `;

		console.log("✅ Database constraints and indexes created successfully!");
	} catch (error) {
		console.error("❌ Error creating database constraints:", error);

		// If the unique constraint already exists, that's fine
		if (error.message.includes("already exists") || error.code === 85) {
			console.log("ℹ️  Constraints already exist, skipping...");
			return;
		}

		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the migration
if (require.main === module) {
	addReservationConstraints()
		.then(() => {
			console.log("Migration completed successfully!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Migration failed:", error);
			process.exit(1);
		});
}

module.exports = { addReservationConstraints };
