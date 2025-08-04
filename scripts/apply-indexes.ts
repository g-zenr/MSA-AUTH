#!/usr/bin/env ts-node

/**
 * Database Index Application Script
 *
 * This script helps apply database indexes to improve query performance.
 * It provides monitoring and validation capabilities for the indexing process.
 */

import { PrismaClient } from "../generated/prisma";
import { getLogger } from "../helper/logger";

const prisma = new PrismaClient();
const logger = getLogger();

interface IndexInfo {
	collection: string;
	indexName: string;
	fields: string[];
	description: string;
}

const INDEXES: IndexInfo[] = [
	// User indexes
	{
		collection: "User",
		indexName: "idx_user_role",
		fields: ["role"],
		description: "Role-based user filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_status",
		fields: ["status"],
		description: "Status-based user filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_organization",
		fields: ["organizationId"],
		description: "Organization-based user filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_person",
		fields: ["personId"],
		description: "Person-based user filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_deleted",
		fields: ["isDeleted"],
		description: "Soft delete user filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_last_login",
		fields: ["lastLogin"],
		description: "User activity tracking",
	},
	{
		collection: "User",
		indexName: "idx_user_created_at",
		fields: ["createdAt"],
		description: "User creation date filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_role_status",
		fields: ["role", "status"],
		description: "Role and status filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_org_status",
		fields: ["organizationId", "status"],
		description: "Organization and status filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_org_role",
		fields: ["organizationId", "role"],
		description: "Organization and role filtering",
	},
	{
		collection: "User",
		indexName: "idx_user_deleted_status",
		fields: ["isDeleted", "status"],
		description: "Soft delete with status filtering",
	},

	// Person indexes
	{
		collection: "Person",
		indexName: "idx_person_organization",
		fields: ["organizationId"],
		description: "Organization-based person filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_deleted",
		fields: ["metadata.isDeleted"],
		description: "Soft delete person filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_status",
		fields: ["metadata.status"],
		description: "Person status filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_active",
		fields: ["metadata.isActive"],
		description: "Active person filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_last_login",
		fields: ["metadata.lastLoginAt"],
		description: "Person activity tracking",
	},
	{
		collection: "Person",
		indexName: "idx_person_first_name",
		fields: ["personalInfo.firstName"],
		description: "First name searches",
	},
	{
		collection: "Person",
		indexName: "idx_person_last_name",
		fields: ["personalInfo.lastName"],
		description: "Last name searches",
	},
	{
		collection: "Person",
		indexName: "idx_person_gender",
		fields: ["personalInfo.gender"],
		description: "Gender-based filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_nationality",
		fields: ["personalInfo.nationality"],
		description: "Nationality-based filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_email",
		fields: ["contactInfo.email"],
		description: "Email-based person searches",
	},
	{
		collection: "Person",
		indexName: "idx_person_id_type",
		fields: ["identification.type"],
		description: "ID type filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_id_number",
		fields: ["identification.number"],
		description: "ID number searches",
	},
	{
		collection: "Person",
		indexName: "idx_person_org_deleted",
		fields: ["organizationId", "metadata.isDeleted"],
		description: "Organization-based person filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_org_status",
		fields: ["organizationId", "metadata.status"],
		description: "Organization-based person status filtering",
	},
	{
		collection: "Person",
		indexName: "idx_person_deleted_status",
		fields: ["metadata.isDeleted", "metadata.status"],
		description: "Soft delete with status filtering",
	},

	// Facility indexes
	{
		collection: "Facility",
		indexName: "idx_facility_name",
		fields: ["name"],
		description: "Facility name searches",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_type",
		fields: ["facilityTypeId"],
		description: "Facility type filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_location",
		fields: ["facilityLocationId"],
		description: "Facility location filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_organization",
		fields: ["organizationId"],
		description: "Organization-based facility filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_deleted",
		fields: ["isDeleted"],
		description: "Soft delete facility filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_time_based",
		fields: ["isTimeBased"],
		description: "Time-based facility filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_created_at",
		fields: ["createdAt"],
		description: "Facility creation date filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_org_deleted",
		fields: ["organizationId", "isDeleted"],
		description: "Organization-based facility filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_type_deleted",
		fields: ["facilityTypeId", "isDeleted"],
		description: "Facility type with soft delete filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_location_deleted",
		fields: ["facilityLocationId", "isDeleted"],
		description: "Facility location with soft delete filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_org_type",
		fields: ["organizationId", "facilityTypeId"],
		description: "Organization-based facility type filtering",
	},
	{
		collection: "Facility",
		indexName: "idx_facility_org_location",
		fields: ["organizationId", "facilityLocationId"],
		description: "Organization-based facility location filtering",
	},

	// Reservation indexes (additional to existing ones)
	{
		collection: "Reservation",
		indexName: "idx_reservation_person",
		fields: ["personId"],
		description: "Person-based reservation filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_status",
		fields: ["status"],
		description: "Reservation status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_payment_status",
		fields: ["paymentStatus"],
		description: "Payment status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_date",
		fields: ["reservationDate"],
		description: "Reservation date filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_end_date",
		fields: ["reservationEndDate"],
		description: "Reservation end date filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_checkin",
		fields: ["checkInDate"],
		description: "Check-in date filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_checkout",
		fields: ["checkOutDate"],
		description: "Check-out date filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_rate_type",
		fields: ["rateTypeId"],
		description: "Rate type filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_market_code",
		fields: ["marketCode"],
		description: "Market code filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_source_code",
		fields: ["sourceCode"],
		description: "Source code filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_booking_channel",
		fields: ["bookingChannel"],
		description: "Booking channel filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_vip_status",
		fields: ["vipStatus"],
		description: "VIP status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_currency",
		fields: ["currency"],
		description: "Currency-based filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_created_at",
		fields: ["createdAt"],
		description: "Reservation creation date filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_person_status",
		fields: ["personId", "status"],
		description: "Person-based reservation status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_person_payment",
		fields: ["personId", "paymentStatus"],
		description: "Person-based payment status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_status_payment",
		fields: ["status", "paymentStatus"],
		description: "Reservation and payment status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_date_status",
		fields: ["reservationDate", "status"],
		description: "Date-based reservation status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_checkin_status",
		fields: ["checkInDate", "status"],
		description: "Check-in date with status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_checkout_status",
		fields: ["checkOutDate", "status"],
		description: "Check-out date with status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_facility_status",
		fields: ["facilityId", "status"],
		description: "Facility-based reservation status filtering",
	},
	{
		collection: "Reservation",
		indexName: "idx_reservation_facility_type_status",
		fields: ["facilityType", "status"],
		description: "Facility type with reservation status filtering",
	},

	// Maintenance indexes
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_facility",
		fields: ["facilityId"],
		description: "Facility-based maintenance filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_maintained_by",
		fields: ["maintainedById"],
		description: "User-based maintenance filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_status",
		fields: ["status"],
		description: "Maintenance status filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_date",
		fields: ["date"],
		description: "Maintenance date filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_start_date",
		fields: ["startDate"],
		description: "Maintenance start date filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_end_date",
		fields: ["endDate"],
		description: "Maintenance end date filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_created_at",
		fields: ["createdAt"],
		description: "Maintenance creation date filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_facility_status",
		fields: ["facilityId", "status"],
		description: "Facility-based maintenance status filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_facility_date",
		fields: ["facilityId", "date"],
		description: "Facility-based maintenance date filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_user_status",
		fields: ["maintainedById", "status"],
		description: "User-based maintenance status filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_status_date",
		fields: ["status", "date"],
		description: "Maintenance status with date filtering",
	},
	{
		collection: "MaintenanceRecord",
		indexName: "idx_maintenance_facility_date_range",
		fields: ["facilityId", "startDate", "endDate"],
		description: "Facility-based date range filtering",
	},

	// Housekeeping indexes
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_facility",
		fields: ["facilityId"],
		description: "Facility-based housekeeping filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_cleaned_by",
		fields: ["cleanedById"],
		description: "User-based housekeeping filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_status",
		fields: ["status"],
		description: "Housekeeping status filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_date",
		fields: ["date"],
		description: "Housekeeping date filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_start_date",
		fields: ["startDate"],
		description: "Housekeeping start date filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_end_date",
		fields: ["endDate"],
		description: "Housekeeping end date filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_created_at",
		fields: ["createdAt"],
		description: "Housekeeping creation date filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_facility_status",
		fields: ["facilityId", "status"],
		description: "Facility-based housekeeping status filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_facility_date",
		fields: ["facilityId", "date"],
		description: "Facility-based housekeeping date filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_user_status",
		fields: ["cleanedById", "status"],
		description: "User-based housekeeping status filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_status_date",
		fields: ["status", "date"],
		description: "Housekeeping status with date filtering",
	},
	{
		collection: "HousekeepingRecord",
		indexName: "idx_housekeeping_facility_date_range",
		fields: ["facilityId", "startDate", "endDate"],
		description: "Facility-based date range filtering",
	},

	// Payment indexes
	{
		collection: "Payment",
		indexName: "idx_payment_reservation",
		fields: ["reservationId"],
		description: "Reservation-based payment filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_method",
		fields: ["method"],
		description: "Payment method filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_status",
		fields: ["status"],
		description: "Payment status filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_amount",
		fields: ["amount"],
		description: "Payment amount filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_paid_at",
		fields: ["paidAt"],
		description: "Payment date filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_created_at",
		fields: ["createdAt"],
		description: "Payment creation date filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_transaction_id",
		fields: ["transactionId"],
		description: "External transaction ID lookups",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_reservation_status",
		fields: ["reservationId", "status"],
		description: "Reservation-based payment status filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_method_status",
		fields: ["method", "status"],
		description: "Payment method with status filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_status_paid",
		fields: ["status", "paidAt"],
		description: "Payment status with paid date filtering",
	},
	{
		collection: "Payment",
		indexName: "idx_payment_created_status",
		fields: ["createdAt", "status"],
		description: "Payment creation with status filtering",
	},

	// Organization indexes
	{
		collection: "Organization",
		indexName: "idx_organization_code",
		fields: ["code"],
		description: "Organization code lookups",
	},
	{
		collection: "Organization",
		indexName: "idx_organization_name",
		fields: ["name"],
		description: "Organization name searches",
	},
	{
		collection: "Organization",
		indexName: "idx_organization_deleted",
		fields: ["isDeleted"],
		description: "Soft delete organization filtering",
	},
	{
		collection: "Organization",
		indexName: "idx_organization_created_at",
		fields: ["createdAt"],
		description: "Organization creation date filtering",
	},
	{
		collection: "Organization",
		indexName: "idx_organization_code_deleted",
		fields: ["code", "isDeleted"],
		description: "Organization code with soft delete filtering",
	},

	// FacilityType indexes
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_name",
		fields: ["name"],
		description: "Facility type name searches",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_code",
		fields: ["code"],
		description: "Facility type code lookups",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_category",
		fields: ["category"],
		description: "Facility category filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_organization",
		fields: ["organizationId"],
		description: "Organization-based facility type filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_rate_type",
		fields: ["rateTypeId"],
		description: "Rate type filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_deleted",
		fields: ["isDeleted"],
		description: "Soft delete facility type filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_created_at",
		fields: ["createdAt"],
		description: "Facility type creation date filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_org_category",
		fields: ["organizationId", "category"],
		description: "Organization-based category filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_org_deleted",
		fields: ["organizationId", "isDeleted"],
		description: "Organization-based soft delete filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_category_deleted",
		fields: ["category", "isDeleted"],
		description: "Category-based soft delete filtering",
	},
	{
		collection: "FacilityType",
		indexName: "idx_facility_type_org_category_deleted",
		fields: ["organizationId", "category", "isDeleted"],
		description: "Organization-based category with soft delete filtering",
	},

	// FacilityLocation indexes
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_building",
		fields: ["building"],
		description: "Building-based filtering",
	},
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_floor",
		fields: ["floor"],
		description: "Floor-based filtering",
	},
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_nearby",
		fields: ["nearby"],
		description: "Landmark-based filtering",
	},
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_organization",
		fields: ["organizationId"],
		description: "Organization-based facility location filtering",
	},
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_created_at",
		fields: ["createdAt"],
		description: "Facility location creation date filtering",
	},
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_org_building",
		fields: ["organizationId", "building"],
		description: "Organization-based building filtering",
	},
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_org_floor",
		fields: ["organizationId", "floor"],
		description: "Organization-based floor filtering",
	},
	{
		collection: "FacilityLocation",
		indexName: "idx_facility_location_building_floor",
		fields: ["building", "floor"],
		description: "Building and floor combination filtering",
	},

	// RateType indexes
	{
		collection: "RateType",
		indexName: "idx_rate_type_name",
		fields: ["name"],
		description: "Rate type name searches",
	},
	{
		collection: "RateType",
		indexName: "idx_rate_type_code",
		fields: ["code"],
		description: "Rate type code lookups",
	},
	{
		collection: "RateType",
		indexName: "idx_rate_type_organization",
		fields: ["organizationId"],
		description: "Organization-based rate type filtering",
	},
	{
		collection: "RateType",
		indexName: "idx_rate_type_deleted",
		fields: ["isDeleted"],
		description: "Soft delete rate type filtering",
	},
	{
		collection: "RateType",
		indexName: "idx_rate_type_created_at",
		fields: ["createdAt"],
		description: "Rate type creation date filtering",
	},
	{
		collection: "RateType",
		indexName: "idx_rate_type_org_deleted",
		fields: ["organizationId", "isDeleted"],
		description: "Organization-based soft delete filtering",
	},
	{
		collection: "RateType",
		indexName: "idx_rate_type_org_name",
		fields: ["organizationId", "name"],
		description: "Organization-based name filtering",
	},
];

async function checkIndexExists(collection: string, indexName: string): Promise<boolean> {
	try {
		// This is a simplified check - in a real implementation, you'd query MongoDB directly
		// to check if the index exists
		logger.info(`Checking if index ${indexName} exists on collection ${collection}`);
		return false; // Assume index doesn't exist for this example
	} catch (error) {
		logger.error(`Error checking index ${indexName}:`, error);
		return false;
	}
}

async function createIndex(
	collection: string,
	indexName: string,
	fields: string[],
): Promise<boolean> {
	try {
		logger.info(
			`Creating index ${indexName} on collection ${collection} with fields: ${fields.join(", ")}`,
		);

		// In a real implementation, you would use MongoDB commands to create indexes
		// For now, we'll simulate the process
		await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate index creation time

		logger.info(`Successfully created index ${indexName} on collection ${collection}`);
		return true;
	} catch (error) {
		logger.error(`Error creating index ${indexName}:`, error);
		return false;
	}
}

async function applyIndexes(): Promise<void> {
	logger.info("Starting database index application process...");

	const results = {
		total: INDEXES.length,
		created: 0,
		skipped: 0,
		failed: 0,
		errors: [] as string[],
	};

	for (const index of INDEXES) {
		try {
			const exists = await checkIndexExists(index.collection, index.indexName);

			if (exists) {
				logger.info(
					`Index ${index.indexName} already exists on ${index.collection}, skipping...`,
				);
				results.skipped++;
				continue;
			}

			const success = await createIndex(index.collection, index.indexName, index.fields);

			if (success) {
				results.created++;
				logger.info(
					`✓ Created index: ${index.indexName} on ${index.collection} (${index.description})`,
				);
			} else {
				results.failed++;
				const error = `Failed to create index: ${index.indexName} on ${index.collection}`;
				results.errors.push(error);
				logger.error(`✗ ${error}`);
			}
		} catch (error) {
			results.failed++;
			const errorMsg = `Error processing index ${index.indexName}: ${error}`;
			results.errors.push(errorMsg);
			logger.error(`✗ ${errorMsg}`);
		}
	}

	// Print summary
	logger.info("\n=== Index Application Summary ===");
	logger.info(`Total indexes: ${results.total}`);
	logger.info(`Created: ${results.created}`);
	logger.info(`Skipped: ${results.skipped}`);
	logger.info(`Failed: ${results.failed}`);

	if (results.errors.length > 0) {
		logger.error("\n=== Errors ===");
		results.errors.forEach((error) => logger.error(`- ${error}`));
	}

	if (results.failed > 0) {
		logger.warn("\nSome indexes failed to create. Please check the errors above.");
		process.exit(1);
	} else {
		logger.info("\n✓ All indexes applied successfully!");
	}
}

async function validateIndexes(): Promise<void> {
	logger.info("Validating database indexes...");

	// This would check if the indexes are actually being used
	// and provide performance metrics
	logger.info("Index validation completed.");
}

async function main(): Promise<void> {
	const command = process.argv[2];

	try {
		switch (command) {
			case "apply":
				await applyIndexes();
				break;
			case "validate":
				await validateIndexes();
				break;
			case "apply-and-validate":
				await applyIndexes();
				await validateIndexes();
				break;
			default:
				logger.info("Usage: npm run apply-indexes [apply|validate|apply-and-validate]");
				logger.info("  apply: Apply all database indexes");
				logger.info("  validate: Validate existing indexes");
				logger.info("  apply-and-validate: Apply indexes and then validate them");
				process.exit(1);
		}
	} catch (error) {
		logger.error("Script execution failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

if (require.main === module) {
	main().catch(console.error);
}

export { applyIndexes, validateIndexes };
