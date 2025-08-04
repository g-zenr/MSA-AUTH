import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../../generated/prisma";
import { getLogger } from "../../helper/logger";
import { config } from "../../config/constant";
import {
	handleQueryValidation,
	buildFieldSelections,
	buildOrderBy,
	createPaginatedResponse,
	buildFilterConditions,
	executeFormattedQuery,
} from "../../utils/queryUtils";
import { buildAdvancedWhereClause, getSearchFields } from "../../utils/advancedFilterUtils";
import { sendSuccessResponse } from "../../utils/validationHelper";

const logger = getLogger();
const personLogger = logger.child({ module: "person" });

export const controller = (prisma: PrismaClient) => {
	const getById = async (req: Request, res: Response, _next: NextFunction) => {
		const { id } = req.params;
		const { fields } = req.query;

		if (!id) {
			personLogger.error(config.ERROR.PERSON.MISSING_ID);
			res.status(400).json({ error: config.ERROR.PERSON.USER_ID_REQUIRED });
			return;
		}

		if (fields && typeof fields !== "string") {
			personLogger.error(`${config.ERROR.PERSON.INVALID_POPULATE}: ${fields}`);
			res.status(400).json({ error: config.ERROR.PERSON.POPULATE_MUST_BE_STRING });
			return;
		}

		personLogger.info(`${config.SUCCESS.PERSON.GETTING_USER_BY_ID}: ${id}`);

		try {
			const query: Prisma.PersonFindFirstArgs = {
				where: {
					id,
					metadata: {
						is: {
							isDeleted: false,
						},
					},
				},
			};

			if (fields) {
				// Use select when fields are specified
				const fieldSelections = fields.split(",").reduce(
					(acc, field) => {
						const parts = field.trim().split(".");
						if (parts.length > 1) {
							const [parent, ...children] = parts;
							acc[parent] = acc[parent] || { select: {} };

							let current = acc[parent].select;
							for (let i = 0; i < children.length - 1; i++) {
								current[children[i]] = current[children[i]] || { select: {} };
								current = current[children[i]].select;
							}
							current[children[children.length - 1]] = true;
						} else {
							acc[parts[0]] = true;
						}
						return acc;
					},
					{ id: true } as Record<string, any>,
				);

				query.select = fieldSelections;
			}

			const person = await prisma.person.findFirst(query);

			if (!person) {
				personLogger.error(`${config.ERROR.PERSON.NOT_FOUND}: ${id}`);
				res.status(404).json({ error: config.ERROR.PERSON.NOT_FOUND });
				return;
			}

			personLogger.info(`${config.SUCCESS.PERSON.RETRIEVED}: ${person.id}`);
			res.status(200).json({
				status: "success",
				message: config.SUCCESS.PERSON.RETRIEVED,
				data: person,
			});
		} catch (error) {
			personLogger.error(`${config.ERROR.PERSON.ERROR_GETTING_USER}: ${error}`);
			res.status(500).json({ error: config.ERROR.PERSON.INTERNAL_SERVER_ERROR });
		}
	};

	const getAll = async (req: Request, res: Response, _next: NextFunction) => {
		const parsedParams = handleQueryValidation(req, res, personLogger);
		if (!parsedParams) return;

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

		personLogger.info(
			`${config.SUCCESS.PERSON.GETTING_ALL_USERS}, page: ${page}, limit: ${limit}, query: ${query}, filter: ${JSON.stringify(filter)}, order: ${order}, format: ${documents ? "documents" : pagination ? "pagination" : count ? "count" : "no-data"}`,
		);

		try {
			// Build base conditions
			const baseConditions: Prisma.PersonWhereInput = {
				metadata: {
					is: {
						isDeleted: false,
					},
				},
			};

			// Get search fields for person and its relations
			const searchFields = getSearchFields("person", ["users"]);

			// Build where clause using advanced filtering
			const whereClause = buildAdvancedWhereClause(
				baseConditions,
				"person",
				query,
				searchFields,
				filter,
			);

			// Define include options for person data
			const includeOptions = {
				users: true,
			};

			const response = await executeFormattedQuery(
				prisma,
				"person",
				whereClause,
				parsedParams,
				"person",
				"person",
				includeOptions,
			);

			personLogger.info(`Retrieved person records successfully`);
			res.status(200).json({
				status: "success",
				message: config.SUCCESS.PERSON.GETTING_ALL_USERS,
				data: response.data || response,
			});
		} catch (error) {
			personLogger.error(`${config.ERROR.PERSON.ERROR_GETTING_USER}: ${error}`);
			res.status(500).json({ error: config.ERROR.PERSON.INTERNAL_SERVER_ERROR });
		}
	};

	const create = async (req: Request, res: Response, _next: NextFunction) => {
		const { organizationId, personalInfo, contactInfo, identification } = req.body;

		const { firstName, lastName, ...otherPersonalInfo } = personalInfo || {};

		if (!firstName || !lastName) {
			personLogger.error(config.ERROR.PERSON.INVALID_ID);
			res.status(400).json({ error: "First name and last name are required" });
			return;
		}

		try {
			const existingPerson = await prisma.person.findFirst({
				where: {
					personalInfo: {
						is: {
							firstName,
							lastName,
						},
					},
					metadata: {
						is: {
							isDeleted: false,
						},
					},
				},
			});

			const dataForPerson = {
				...(organizationId && { organizationId }),
				personalInfo: {
					...personalInfo,
					firstName,
					lastName,
					...otherPersonalInfo,
					...(personalInfo.gender && { gender: personalInfo.gender.toLowerCase() }),
					...(personalInfo.dateOfBirth && {
						dateOfBirth: new Date(personalInfo.dateOfBirth),
					}),
				},
				...(contactInfo && {
					contactInfo: {
						...contactInfo,
					},
				}),
				...(identification && {
					identification: {
						...identification,
						...(identification.issueDate && {
							issueDate: new Date(identification.issueDate),
						}),
						...(identification.expiryDate && {
							expiryDate: new Date(identification.expiryDate),
						}),
					},
				}),
			};

			if (existingPerson) {
				personLogger.info(
					`Found existing person, updating with new data: ${existingPerson.id}`,
				);

				const updatedPerson = await prisma.person.update({
					where: { id: existingPerson.id },
					data: dataForPerson,
				});

				personLogger.info(`${config.SUCCESS.PERSON.UPDATE}: ${updatedPerson.id}`);
				res.status(200).json({
					...updatedPerson,
					message: "Existing person found and updated",
				});
				return;
			}

			const personDataToCreate: Prisma.PersonCreateInput = {
				...dataForPerson,
				metadata: {
					isDeleted: false,
					isActive: true,
				},
			};

			const newPerson = await prisma.person.create({
				data: personDataToCreate,
			});

			personLogger.info(`${config.SUCCESS.PERSON.CREATED}: ${newPerson.id}`);
			res.status(201).json(newPerson);
		} catch (error) {
			let errorMessage = "An unknown error occurred";
			let errorCode = undefined;
			let errorName = undefined;

			if (error instanceof Error) {
				errorMessage = error.message;
				errorName = error.name;
			}
			if (typeof error === "object" && error !== null && "code" in error) {
				errorCode = (error as { code?: string }).code;
			}

			personLogger.error(`${config.ERROR.PERSON.INTERNAL_SERVER_ERROR}: ${errorMessage}`, {
				error,
			});
			if (errorName === "PrismaClientValidationError" || errorCode?.startsWith("P")) {
				console.error("Detailed Prisma Error:", JSON.stringify(error, null, 2));
			}
			res.status(500).json({
				error: config.ERROR.PERSON.INTERNAL_SERVER_ERROR,
				details: errorMessage,
			});
		}
	};

	const update = async (req: Request, res: Response, _next: NextFunction) => {
		const { id } = req.params;
		const { organizationId, personalInfo, contactInfo, identification, ...others } = req.body;

		if (!id) {
			personLogger.error(config.ERROR.PERSON.MISSING_ID);
			res.status(400).json({ error: config.ERROR.PERSON.USER_ID_REQUIRED });
			return;
		}

		if (Object.keys(req.body).length === 0) {
			personLogger.error(config.ERROR.PERSON.NO_UPDATE_FIELDS);
			res.status(400).json({
				error: config.ERROR.PERSON.AT_LEAST_ONE_FIELD_REQUIRED,
			});
			return;
		}

		personLogger.info(`Updating person: ${id}`);

		try {
			const existingPerson = await prisma.person.findUnique({
				where: { id },
			});

			if (!existingPerson) {
				personLogger.error(`${config.ERROR.PERSON.NOT_FOUND}: ${id}`);
				res.status(404).json({ error: config.ERROR.PERSON.NOT_FOUND });
				return;
			}

			// Prepare update data
			const updateData: any = {
				...others,
				...(organizationId !== undefined && { organizationId }),
			};

			// Handle personalInfo updates
			if (personalInfo) {
				updateData.personalInfo = {
					...personalInfo,
					...(personalInfo.gender && { gender: personalInfo.gender.toLowerCase() }),
					...(personalInfo.dateOfBirth && {
						dateOfBirth: new Date(personalInfo.dateOfBirth),
					}),
				};
			}

			// Handle contactInfo updates
			if (contactInfo) {
				updateData.contactInfo = contactInfo;
			}

			// Handle identification updates
			if (identification) {
				updateData.identification = {
					...identification,
					...(identification.issueDate && {
						issueDate: new Date(identification.issueDate),
					}),
					...(identification.expiryDate && {
						expiryDate: new Date(identification.expiryDate),
					}),
				};
			}

			const updatedPerson = await prisma.person.update({
				where: { id },
				data: updateData,
			});

			personLogger.info(`${config.SUCCESS.PERSON.UPDATE}: ${updatedPerson.id}`);
			res.status(200).json(updatedPerson);
		} catch (error) {
			personLogger.error(`${config.ERROR.PERSON.ERROR_UPDATING_USER}: ${error}`);
			res.status(500).json({ error: config.ERROR.PERSON.INTERNAL_SERVER_ERROR });
		}
	};

	const remove = async (req: Request, res: Response, _next: NextFunction) => {
		const { id } = req.params;

		if (!id) {
			personLogger.error(config.ERROR.PERSON.MISSING_ID);
			res.status(400).json({ error: config.ERROR.PERSON.USER_ID_REQUIRED });
			return;
		}

		personLogger.info(`${config.SUCCESS.PERSON.SOFT_DELETING}: ${id}`);

		try {
			const existingUser = await prisma.person.findUnique({
				where: { id },
			});

			if (!existingUser) {
				personLogger.error(`${config.ERROR.PERSON.NOT_FOUND}: ${id}`);
				res.status(404).json({ error: config.ERROR.PERSON.NOT_FOUND });
				return;
			}

			await prisma.person.update({
				where: { id },
				data: {
					metadata: {
						isDeleted: true,
					},
				},
			});

			personLogger.info(`${config.SUCCESS.PERSON.DELETED}: ${id}`);
			return sendSuccessResponse(res, config.SUCCESS.PERSON.DELETED);
		} catch (error) {
			personLogger.error(`${config.ERROR.PERSON.ERROR_DELETING_USER}: ${error}`);
			res.status(500).json({ error: config.ERROR.PERSON.INTERNAL_SERVER_ERROR });
		}
	};

	return {
		getById,
		getAll,
		create,
		update,
		remove,
	};
};
