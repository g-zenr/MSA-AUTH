import { PrismaClient } from "../generated/prisma";
import { createDefaultMetadata } from "../helper/services/facilityTypeHelper";

const prisma = new PrismaClient();

async function fixFacilityTypeMetadata() {
	console.log("🔧 Starting facility type details migration...");

	try {
		// Find all facility types with null details
		const facilityTypesWithNullMetadata = await prisma.facilityType.findMany({
			where: {
				metadata: null,
			},
			select: {
				id: true,
				name: true,
				category: true,
				metadata: true,
			},
		});

		console.log(
			`📊 Found ${facilityTypesWithNullMetadata.length} facility types with null details`,
		);

		if (facilityTypesWithNullMetadata.length === 0) {
			console.log("✅ No facility types need migration - all have valid details");
			return;
		}

		// Update each facility type with default metadata
		const updatePromises = facilityTypesWithNullMetadata.map(async (facilityType) => {
			const defaultDetails = createDefaultMetadata(facilityType.category);

			console.log(
				`🔄 Updating facility type "${facilityType.name}" (${facilityType.category}) with default details:`,
				defaultDetails,
			);

			return await prisma.facilityType.update({
				where: { id: facilityType.id },
				data: { metadata: defaultDetails },
			});
		});

		const updatedFacilityTypes = await Promise.all(updatePromises);

		console.log(
			`✅ Successfully updated ${updatedFacilityTypes.length} facility types with default details`,
		);

		// Verify the updates
		const verificationCount = await prisma.facilityType.count({
			where: {
				metadata: null,
			},
		});

		if (verificationCount === 0) {
			console.log("🎉 Migration completed successfully - no more null details found");
		} else {
			console.warn(`⚠️ Warning: ${verificationCount} facility types still have null details`);
		}
	} catch (error) {
		console.error("❌ Error during migration:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the migration if this script is executed directly
if (require.main === module) {
	fixFacilityTypeMetadata()
		.then(() => {
			console.log("🏁 Migration script completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("💥 Migration script failed:", error);
			process.exit(1);
		});
}

export { fixFacilityTypeMetadata };
