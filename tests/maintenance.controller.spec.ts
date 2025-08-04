import { controller } from "../app/maintenance/maintenance.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Maintenance Controller", () => {
	let maintenanceController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockMaintenance = {
		id: "507f1f77bcf86cd799439022",
		date: new Date("2024-01-15T10:00:00Z"),
		description: "Regular HVAC system maintenance",
		cost: 2500.0,
		facilityId: "507f1f77bcf86cd799439015",
		maintainedById: "507f1f77bcf86cd799439012",
		startDate: new Date("2024-01-15T09:00:00Z"),
		endDate: new Date("2024-01-15T12:00:00Z"),
		status: "COMPLETED",
		facility: {
			id: "507f1f77bcf86cd799439015",
			name: "Conference Room A",
		},
		maintainedBy: {
			id: "507f1f77bcf86cd799439012",
			userName: "maintenance_user",
			person: {
				personalInfo: {
					firstName: "Mike",
					lastName: "Johnson",
				},
			},
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			maintenanceRecord: {
				findMany: async (_params: Prisma.MaintenanceRecordFindManyArgs) => [
					mockMaintenance,
				],
				count: async (_params: Prisma.MaintenanceRecordCountArgs) => 1,
				findFirst: async (params: Prisma.MaintenanceRecordFindFirstArgs) =>
					params.where?.id === mockMaintenance.id ? mockMaintenance : null,
				findUnique: async (params: Prisma.MaintenanceRecordFindUniqueArgs) =>
					params.where?.id === mockMaintenance.id ? mockMaintenance : null,
				create: async (params: Prisma.MaintenanceRecordCreateArgs) => ({
					...mockMaintenance,
					...params.data,
				}),
				update: async (params: Prisma.MaintenanceRecordUpdateArgs) => ({
					...mockMaintenance,
					...params.data,
				}),
				delete: async (params: Prisma.MaintenanceRecordDeleteArgs) => {
					if (params.where?.id === mockMaintenance.id) {
						return { ...mockMaintenance, isDeleted: true };
					}
					throw new Error("Record not found");
				},
			},
			facility: {
				findUnique: async (params: Prisma.FacilityFindUniqueArgs) =>
					params.where?.id === mockMaintenance.facilityId
						? mockMaintenance.facility
						: null,
			},
			user: {
				findUnique: async (params: Prisma.UserFindUniqueArgs) =>
					params.where?.id === mockMaintenance.maintainedById
						? mockMaintenance.maintainedBy
						: null,
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		maintenanceController = controller(prisma as PrismaClient);
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
		it("should return paginated maintenance records", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await maintenanceController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a maintenance record", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockMaintenance.id };
			await maintenanceController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockMaintenance.id });
		});

		it("should handle non-existent maintenance record", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await maintenanceController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new maintenance record", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				date: "2024-02-15T10:00:00.000Z",
				description: "Electrical system inspection",
				cost: 1500.0,
				facilityId: "507f1f77bcf86cd799439015",
				maintainedById: "507f1f77bcf86cd799439012",
				status: "PENDING",
			};
			req.body = createData;
			await maintenanceController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update maintenance record details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				status: "IN_PROGRESS",
				cost: 2750.0,
				description: "Regular HVAC system maintenance - Updated scope",
			};
			req.params = { id: mockMaintenance.id };
			req.body = updateData;
			await maintenanceController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a maintenance record", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockMaintenance.id };
			await maintenanceController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent maintenance record deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await maintenanceController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
