import { controller } from "../app/module/module.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Module Controller", () => {
	let moduleController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockModule = {
		id: "507f1f77bcf86cd799439025",
		name: "Reservation Management",
		description: "Module for managing facility reservations and bookings",
		icon: "calendar-check",
		code: "RESERVATION_MGT",
		type: "core",
		isDeleted: false,
		appId: "507f1f77bcf86cd799439026",
		app: {
			id: "507f1f77bcf86cd799439026",
			name: "Facility Management System",
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			module: {
				findMany: async (_params: Prisma.ModuleFindManyArgs) => [mockModule],
				count: async (_params: Prisma.ModuleCountArgs) => 1,
				findFirst: async (params: Prisma.ModuleFindFirstArgs) =>
					params.where?.id === mockModule.id ? mockModule : null,
				findUnique: async (params: Prisma.ModuleFindUniqueArgs) =>
					params.where?.id === mockModule.id ? mockModule : null,
				create: async (params: Prisma.ModuleCreateArgs) => ({
					...mockModule,
					...params.data,
				}),
				update: async (params: Prisma.ModuleUpdateArgs) => ({
					...mockModule,
					...params.data,
				}),
			},
			app: {
				findUnique: async (params: Prisma.AppFindUniqueArgs) =>
					params.where?.id === mockModule.appId ? mockModule.app : null,
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		moduleController = controller(prisma as PrismaClient);
		sentData = undefined;
		statusCode = 200;
		req = {
			query: {},
			params: {},
			body: {},
		};
		res = {
			send: (data: any) => {
				sentData = data;
				return res;
			},
			status: (code: number) => {
				statusCode = code;
				return res;
			},
			json: (data: any) => {
				sentData = data;
				return res;
			},
			end: () => res,
		} as Response;
		next = () => {};
	});

	describe(".getAll()", () => {
		it("should return paginated modules", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await moduleController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a module", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockModule.id };
			await moduleController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockModule.id });
		});

		it("should handle non-existent module", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await moduleController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new module", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "User Management",
				description: "Module for managing users and permissions",
				icon: "users",
				code: "USER_MGT",
				type: "core",
				appId: "507f1f77bcf86cd799439026",
			};
			req.body = createData;
			await moduleController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update module details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Advanced Reservation Management",
				description:
					"Enhanced module for managing facility reservations with advanced features",
				icon: "calendar-plus",
				type: "premium",
			};
			req.params = { id: mockModule.id };
			req.body = updateData;
			await moduleController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a module", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockModule.id };
			await moduleController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent module deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await moduleController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
