import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../../generated/prisma";
import { getLogger } from "../../helper/logger";
import { config } from "../../config/constant";
import { CreateRoleSchema, UpdateRoleSchema, ObjectIdSchema } from "../../zod/role.zod";
import {
	handleQueryValidation,
	buildFieldSelections,
	buildOrderBy,
	createPaginatedResponse,
	executeFormattedQuery,
} from "../../utils/queryUtils";
import { buildAdvancedWhereClause, getSearchFields } from "../../utils/advancedFilterUtils";
import { sendSuccessResponse } from "../../utils/validationHelper";

const logger = getLogger();
const roleLogger = logger.child({ module: "role" });

export const controller = (prisma: PrismaClient) => {
	const create = async (req: Request, res: Response, _next: NextFunction) => {
		try {
			// Validate request data using Zod
			const validationResult = CreateRoleSchema.safeParse(req.body);
			if (!validationResult.success) {
				const errors = validationResult.error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				}));
				const errorMessages = errors
					.map((err) => `${err.field}: ${err.message}`)
					.join(", ");
				roleLogger.error(`Validation error: ${errorMessages}`);
				res.status(400).json({
					status: "error",
					message: "Validation failed",
					errors: errors,
					code: "VALIDATION_ERROR",
					timestamp: new Date().toISOString(),
				});
				return;
			}

			const validatedData = validationResult.data;

			// Check if role with the same name already exists
			const existingRole = await prisma.userRole.findFirst({
				where: { name: validatedData.name },
			});

			if (existingRole) {
				roleLogger.error(`Role with name "${validatedData.name}" already exists`);
				res.status(409).json({
					error: "Role with this name already exists",
					code: "ROLE_NAME_EXISTS",
				});
				return;
			}

			const role = await prisma.userRole.create({
				data: validatedData,
			});

			roleLogger.info(`Role created successfully: ${role.id}`);

			res.status(201).json({
				status: "success",
				message: "Role created successfully",
				data: role,
			});
		} catch (error: any) {
			roleLogger.error(`Error creating role: ${error}`);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	const getAll = async (req: Request, res: Response, _next: NextFunction) => {
		// Validate and parse query parameters using utility function
		const parsedParams = handleQueryValidation(req, res, roleLogger);
		if (!parsedParams) return; // Response already sent if validation failed

		const {
			page,
			limit,
			skip,
			sort,
			fields,
			query,
			filter,
			order,
			documents,
			pagination,
			count,
		} = parsedParams;

		roleLogger.info(
			`Getting all roles: page: ${page}, limit: ${limit}, query: ${query}, order: ${order}, format: ${documents ? "documents" : pagination ? "pagination" : count ? "count" : "no-data"}`,
		);

		try {
			// Build base conditions - UserRole doesn't have isDeleted field
			const baseConditions: Prisma.UserRoleWhereInput = {};

			// Get search fields for role
			const searchFields = getSearchFields("userRole", []);

			// Build where clause using advanced filtering
			const whereClause = buildAdvancedWhereClause(
				baseConditions,
				"userRole",
				query,
				searchFields,
				filter,
			);

			const response = await executeFormattedQuery(
				prisma,
				"userRole",
				whereClause,
				parsedParams,
				"roles",
				"roles",
			);

			roleLogger.info(`Retrieved roles successfully`);
			res.status(200).json({
				status: "success",
				message: "Roles retrieved successfully",
				data: response.data || response,
			});
		} catch (error: any) {
			roleLogger.error(`Error getting roles: ${error}`);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	const getById = async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const idValidation = ObjectIdSchema.safeParse(req.params.id);
			if (!idValidation.success) {
				roleLogger.error(`Invalid role ID: ${req.params.id}`);
				res.status(400).json({
					error: "Invalid role ID format",
					code: "INVALID_ID_FORMAT",
				});
				return;
			}

			const roleId = idValidation.data;

			const role = await prisma.userRole.findUnique({
				where: { id: roleId },
			});

			if (!role) {
				roleLogger.error(`Role not found: ${roleId}`);
				res.status(404).json({
					error: "Role not found",
					code: "ROLE_NOT_FOUND",
				});
				return;
			}

			roleLogger.info(`Role retrieved successfully: ${roleId}`);

			res.status(200).json({
				status: "success",
				message: "Role retrieved successfully",
				data: role,
			});
		} catch (error: any) {
			roleLogger.error(`Error getting role: ${error}`);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	const update = async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const idValidation = ObjectIdSchema.safeParse(req.params.id);
			if (!idValidation.success) {
				roleLogger.error(`Invalid role ID: ${req.params.id}`);
				res.status(400).json({
					error: "Invalid role ID format",
					code: "INVALID_ID_FORMAT",
				});
				return;
			}

			const roleId = idValidation.data;

			// Validate request data using Zod
			const validationResult = UpdateRoleSchema.safeParse(req.body);
			if (!validationResult.success) {
				const errors = validationResult.error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				}));
				const errorMessages = errors
					.map((err) => `${err.field}: ${err.message}`)
					.join(", ");
				roleLogger.error(`Validation error: ${errorMessages}`);
				res.status(400).json({
					status: "error",
					message: "Validation failed",
					errors: errors,
					code: "VALIDATION_ERROR",
					timestamp: new Date().toISOString(),
				});
				return;
			}

			const validatedData = validationResult.data;

			// Check if role exists
			const existingRole = await prisma.userRole.findUnique({
				where: { id: roleId },
			});

			if (!existingRole) {
				roleLogger.error(`Role not found: ${roleId}`);
				res.status(404).json({
					error: "Role not found",
					code: "ROLE_NOT_FOUND",
				});
				return;
			}

			// Check if name is being updated and if it conflicts with another role
			if (validatedData.name && validatedData.name !== existingRole.name) {
				const nameConflict = await prisma.userRole.findFirst({
					where: {
						name: validatedData.name,
						id: { not: roleId },
					},
				});

				if (nameConflict) {
					roleLogger.error(`Role with name "${validatedData.name}" already exists`);
					res.status(409).json({
						error: "Role with this name already exists",
						code: "ROLE_NAME_EXISTS",
					});
					return;
				}
			}

			const updatedRole = await prisma.userRole.update({
				where: { id: roleId },
				data: validatedData,
			});

			roleLogger.info(`Role updated successfully: ${roleId}`);

			res.status(200).json({
				status: "success",
				message: "Role updated successfully",
				data: updatedRole,
			});
		} catch (error: any) {
			roleLogger.error(`Error updating role: ${error}`);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	const remove = async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const idValidation = ObjectIdSchema.safeParse(req.params.id);
			if (!idValidation.success) {
				roleLogger.error(`Invalid role ID: ${req.params.id}`);
				res.status(400).json({
					error: "Invalid role ID format",
					code: "INVALID_ID_FORMAT",
				});
				return;
			}

			const roleId = idValidation.data;

			// Check if role exists
			const existingRole = await prisma.userRole.findUnique({
				where: { id: roleId },
			});

			if (!existingRole) {
				roleLogger.error(`Role not found: ${roleId}`);
				res.status(404).json({
					error: "Role not found",
					code: "ROLE_NOT_FOUND",
				});
				return;
			}

			await prisma.userRole.delete({
				where: { id: roleId },
			});

			roleLogger.info(`Role deleted successfully: ${roleId}`);

			return sendSuccessResponse(res, "Successfully deleted role");
		} catch (error: any) {
			roleLogger.error(`Error deleting role: ${error}`);
			res.status(500).json({ error: "Internal server error" });
		}
	};

	return {
		create,
		getAll,
		getById,
		update,
		remove,
	};
};
