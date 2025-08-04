import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../../generated/prisma";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { getLogger } from "../../helper/logger";
import { controller as personController } from "../person/person.controller";
import {
	RegisterSchema,
	LoginSchema,
	UpdatePasswordSchema,
	AuthErrorResponseSchema,
	type RegisterInput,
	type LoginInput,
	type UpdatePasswordInput,
} from "../../zod/auth.zod";
import {
	validateWithZod,
	sendValidationError,
	sendSuccessResponse,
	sendErrorResponse,
	sendUnauthorizedResponse,
	sendConflictResponse,
	sendNotFoundResponse,
} from "../../utils/validationHelper";
import { config } from "../../config/constant";

const logger = getLogger();
const authLogger = logger.child({ module: "auth" });

export const controller = (prisma: PrismaClient) => {
	const personCtrl = personController(prisma);

	const register = async (req: Request, res: Response, next: NextFunction) => {
		const validation = validateWithZod(RegisterSchema, req.body);
		if (!validation.success) {
			return sendValidationError(
				res,
				config.ERROR.AUTH.REGISTRATION_VALIDATION_FAILED,
				validation.error.errors,
			);
		}

		const {
			email,
			password,
			userName,
			role,
			subRole,
			firstName,
			lastName,
			organizationId,
			...personData
		} = validation.data as RegisterInput;

		authLogger.info(`${config.INFO.USER.REGISTERING_USER}: ${email}`);

		try {
			if (organizationId) {
				const organization = await prisma.organization.findUnique({
					where: { id: organizationId },
				});

				if (!organization) {
					authLogger.error(
						`${config.ERROR.AUTH.ORGANIZATION_NOT_FOUND}: ${organizationId}`,
					);
					return sendNotFoundResponse(
						res,
						config.COMMON.ORGANIZATION,
						config.COMMON.ORGANIZATION_ID,
					);
				}

				authLogger.info(`${config.ERROR.AUTH.ORGANIZATION_VERIFIED}: ${organization.name}`);
			}

			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				authLogger.error(`${config.ERROR.AUTH.USER_ALREADY_EXISTS}: ${email}`);
				return sendConflictResponse(
					res,
					config.COMMON.EMAIL,
					config.ERROR.AUTH.USER_ALREADY_EXISTS,
				);
			}

			const hashedPassword = await argon2.hash(password);

			const result = await prisma.$transaction(async (tx) => {
				const mockReq = {
					body: {
						personalInfo: {
							firstName,
							lastName,
							...personData,
						},
						...(organizationId && { organizationId }),
					},
				} as Request;

				const mockRes = {
					statusCode: 0,
					data: null,
					status: function (code: number) {
						this.statusCode = code;
						return this;
					},
					json: function (data: any) {
						this.data = data;
						return this;
					},
				} as any;

				await personCtrl.create(mockReq, mockRes, next);

				if (mockRes.statusCode !== 201 && mockRes.statusCode !== 200) {
					throw new Error(config.ERROR.AUTH.FAILED_TO_CREATE_OR_FIND_PERSON);
				}

				const person = mockRes.data;

				authLogger.info(
					`${config.INFO.USER.CREATING_USER_WITH_PERSON_ID}: ${person.id}${organizationId ? `, ${config.COMMON.ORGANIZATION_ID}: ${organizationId}` : ", ${config.COMMON.NO_ORGANIZATION}"}`,
				);

				const user = await tx.user.create({
					data: {
						email,
						userName: userName,
						password: hashedPassword,
						role: role,
						subRole: subRole,
						loginMethod: config.COMMON.EMAIL_METHOD,
						personId: person.id,
						...(organizationId && { organizationId }),
					},
					include: {
						person: true,
						organization: true,
					},
				});

				return {
					user,
					isExistingPerson: mockRes.statusCode === 200,
				};
			});

			const userResponse = {
				id: result.user.id,
				email: result.user.email,
				userName: result.user.userName,
				role: result.user.role,
				subRole: result.user.subRole,
				avatar: result.user.avatar,
				person: result.user.person,
				organization: result.user.organization
					? {
							id: result.user.organization.id,
							name: result.user.organization.name,
							description: result.user.organization.description,
							code: result.user.organization.code,
							branding: result.user.organization.branding,
						}
					: null,
			};

			authLogger.info(`${config.SUCCESS.AUTH.USER_CREATED}: ${result.user.id}`);
			return sendSuccessResponse(
				res,
				config.SUCCESS.AUTH.REGISTRATION_SUCCESSFUL,
				userResponse,
				201,
			);
		} catch (error) {
			authLogger.error(`${config.ERROR.AUTH.ERROR_DURING_REGISTRATION}: ${error}`);
			return sendErrorResponse(
				res,
				config.ERROR.AUTH.ERROR_DURING_REGISTRATION,
				"REGISTRATION_ERROR",
			);
		}
	};

	const login = async (req: Request, res: Response, _next: NextFunction) => {
		const validation = validateWithZod(LoginSchema, req.body);
		if (!validation.success) {
			return sendValidationError(
				res,
				config.ERROR.AUTH.LOGIN_VALIDATION_FAILED,
				validation.error.errors,
			);
		}

		const { email, password } = validation.data as LoginInput;

		authLogger.info(`${config.INFO.USER.LOGGING_IN_USER}: ${email}`);

		try {
			const user = await prisma.user.findUnique({
				where: { email },
				include: {
					person: true,
					organization: true,
				},
			});

			if (!user || !user.password) {
				authLogger.error(`${config.ERROR.AUTH.INVALID_CREDENTIALS}: ${email}`);
				return sendUnauthorizedResponse(res, config.ERROR.AUTH.INVALID_CREDENTIALS);
			}

			const isPasswordValid = await argon2.verify(user.password, password);

			if (!isPasswordValid) {
				authLogger.error(`${config.ERROR.AUTH.INVALID_CREDENTIALS}: ${email}`);
				return sendUnauthorizedResponse(res, config.ERROR.AUTH.INVALID_CREDENTIALS);
			}

			await prisma.user.update({
				where: { id: user.id },
				data: { lastLogin: new Date() },
			});

			const token = jwt.sign(
				{
					userId: user.id,
					role: user.role,
					firstName: user.person?.personalInfo?.firstName,
					lastName: user.person?.personalInfo?.lastName,
					organizationId: user.organizationId,
				},
				process.env.JWT_SECRET || "",
				{
					expiresIn: "1d",
				},
			);

			authLogger.info(`${config.SUCCESS.AUTH.TOKEN_GENERATED} for user: ${user.id}`);
			const isProduction = process.env.NODE_ENV === config.COMMON.PRODUCTION;
			res.cookie(config.COMMON.TOKEN, token, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "none" : "lax",
				maxAge: 1 * 24 * 60 * 60 * 1000,
				path: "/",
			});

			const userResponse = {
				id: user.id,
				email: user.email,
				role: user.role,
				subRole: user.subRole,
				avatar: user.avatar,
				person: user.person,
				organization: user.organization
					? {
							id: user.organization.id,
							name: user.organization.name,
							description: user.organization.description,
							code: user.organization.code,
							branding: user.organization.branding,
						}
					: null,
			};

			authLogger.info(`${config.SUCCESS.AUTH.USER_LOGGED_IN}: ${user.id}`);
			return sendSuccessResponse(
				res,
				config.SUCCESS.AUTH.LOGGED_IN_SUCCESSFULLY,
				userResponse,
			);
		} catch (error) {
			authLogger.error(`${config.ERROR.AUTH.ERROR_DURING_LOGIN}: ${error}`);
			return sendErrorResponse(res, config.ERROR.AUTH.ERROR_DURING_LOGIN, "LOGIN_ERROR");
		}
	};

	const updatePassword = async (req: Request, res: Response, _next: NextFunction) => {
		const validation = validateWithZod(UpdatePasswordSchema, req.body);
		if (!validation.success) {
			return sendValidationError(
				res,
				config.ERROR.AUTH.PASSWORD_UPDATE_VALIDATION_FAILED,
				validation.error.errors,
			);
		}

		const { userId, password } = validation.data as UpdatePasswordInput;

		try {
			const existingUser = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!existingUser) {
				authLogger.error(`${config.ERROR.AUTH.USER_NOT_FOUND}: ${userId}`);
				return sendNotFoundResponse(res, config.COMMON.USER, config.COMMON.USER_ID);
			}

			const hashedPassword = await argon2.hash(password);

			await prisma.user.update({
				where: { id: userId },
				data: { password: hashedPassword },
			});

			authLogger.info(`${config.SUCCESS.AUTH.PASSWORD_UPDATED_SUCCESSFULLY}: ${userId}`);
			return sendSuccessResponse(res, config.SUCCESS.AUTH.PASSWORD_UPDATED_SUCCESSFULLY);
		} catch (error) {
			authLogger.error(`${config.ERROR.AUTH.ERROR_UPDATING_PASSWORD}: ${error}`);
			return sendErrorResponse(
				res,
				config.ERROR.AUTH.ERROR_UPDATING_PASSWORD,
				"PASSWORD_UPDATE_ERROR",
			);
		}
	};

	const logout = async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const isProduction = process.env.NODE_ENV === config.COMMON.PRODUCTION;

			// Clear the JWT cookie
			res.cookie(config.COMMON.TOKEN, "", {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "none" : "lax",
				maxAge: 0, // Expire immediately
				path: "/",
			});

			authLogger.info("User logged out successfully");
			return sendSuccessResponse(res, "Logged out successfully");
		} catch (error) {
			authLogger.error(`Error during logout: ${error}`);
			return sendErrorResponse(res, "Error during logout", "LOGOUT_ERROR");
		}
	};

	return {
		register,
		login,
		updatePassword,
		logout,
	};
};
