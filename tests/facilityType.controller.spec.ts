import { controller } from "../app/facilityType/facilityType.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("FacilityType Controller", () => {
	let facilityTypeController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;
	let mockLogger: any;

	const mockFacilityType = {
		id: "507f1f77bcf86cd799439016",
		name: "Meeting Room",
		description: "Standard meeting room",
		category: "MEETING",
		organizationId: "507f1f77bcf86cd799439013",
		rateTypeId: "507f1f77bcf86cd799439019",
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		mockLogger = {
			info: () => {},
			error: () => {},
			warn: () => {},
			debug: () => {},
		};

		prisma = {
			facilityType: {
				findMany: async (_params: Prisma.FacilityTypeFindManyArgs) => [mockFacilityType],
				count: async (_params: Prisma.FacilityTypeCountArgs) => 1,
				findFirst: async (params: Prisma.FacilityTypeFindFirstArgs) =>
					params.where?.id === mockFacilityType.id ? mockFacilityType : null,
				findUnique: async (params: Prisma.FacilityTypeFindUniqueArgs) =>
					params.where?.id === mockFacilityType.id ? mockFacilityType : null,
				create: async (params: Prisma.FacilityTypeCreateArgs) => ({
					...mockFacilityType,
					...params.data,
				}),
				update: async (params: Prisma.FacilityTypeUpdateArgs) => ({
					...mockFacilityType,
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

		facilityTypeController = controller(prisma as PrismaClient, mockLogger);
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
		it("should return paginated facility types", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await facilityTypeController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a facility type", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockFacilityType.id };
			await facilityTypeController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});

		it("should handle non-existent facility type", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await facilityTypeController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new facility type", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "Conference Room",
				description: "Large conference room",
				organizationId: "507f1f77bcf86cd799439013",
			};
			req.body = createData;
			await facilityTypeController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update facility type details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Updated Meeting Room",
				description: "Updated description",
			};
			req.params = { id: mockFacilityType.id };
			req.body = updateData;
			await facilityTypeController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a facility type", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockFacilityType.id };
			await facilityTypeController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});
	});
});
