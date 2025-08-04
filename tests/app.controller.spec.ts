import { controller } from "../app/app/app.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("App Controller", () => {
	let appController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockApp = {
		id: "507f1f77bcf86cd799439026",
		name: "Facility Management System",
		description: "Comprehensive facility management application",
		icon: "building",
		code: "FMS",
		isDeleted: false,
		modules: [
			{
				id: "507f1f77bcf86cd799439025",
				name: "Reservation Management",
				code: "RESERVATION_MGT",
				isDeleted: false,
			},
		],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			app: {
				findMany: async (_params: Prisma.AppFindManyArgs) => [mockApp],
				count: async (_params: Prisma.AppCountArgs) => 1,
				findFirst: async (params: Prisma.AppFindFirstArgs) =>
					params.where?.id === mockApp.id ? mockApp : null,
				findUnique: async (params: Prisma.AppFindUniqueArgs) =>
					params.where?.id === mockApp.id ? mockApp : null,
				create: async (params: Prisma.AppCreateArgs) => ({
					...mockApp,
					...params.data,
				}),
				update: async (params: Prisma.AppUpdateArgs) => ({
					...mockApp,
					...params.data,
				}),
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		appController = controller(prisma as PrismaClient);
		sentData = undefined;
		statusCode = 200;
		req = {
			query: {},
			params: {},
			body: {},
		} as Request;
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
		it("should return paginated apps", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await appController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("status", "success");
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return an app", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockApp.id };
			await appController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("status", "success");
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockApp.id });
		});

		it("should handle non-existent app", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await appController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new app", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "User Management System",
				description: "Application for managing users and permissions",
				icon: "users",
				code: "UMS",
			};
			req.body = createData;
			await appController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			expect(sentData).to.have.property("id");
		});

		it("should handle validation errors", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "",
				code: "UMS",
			};
			req.body = createData;
			await appController.create(req as Request, res, next);
			expect(statusCode).to.equal(400);
			expect(sentData).to.have.property("status", "error");
		});
	});

	describe(".update()", () => {
		it("should update app details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Enhanced Facility Management System",
				description:
					"Updated comprehensive facility management application with new features",
				icon: "building-plus",
			};
			req.params = { id: mockApp.id };
			req.body = updateData;
			await appController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("id");
		});

		it("should handle non-existent app update", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Updated App",
			};
			req.params = { id: "507f1f77bcf86cd799439099" };
			req.body = updateData;
			await appController.update(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".remove()", () => {
		it("should delete an app", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockApp.id };
			await appController.remove(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("status", "success");
		});

		it("should handle non-existent app deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await appController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
