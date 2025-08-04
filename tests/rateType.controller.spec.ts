import { controller } from "../app/rateType/rateType.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("RateType Controller", () => {
	let rateTypeController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockRateType = {
		id: "507f1f77bcf86cd799439019",
		name: "Standard Rate",
		description: "Standard pricing rate",
		organizationId: "507f1f77bcf86cd799439013",
		basePrice: 100.0,
		currency: "USD",
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			rateType: {
				findMany: async (_params: Prisma.RateTypeFindManyArgs) => [mockRateType],
				count: async (_params: Prisma.RateTypeCountArgs) => 1,
				findFirst: async (params: Prisma.RateTypeFindFirstArgs) =>
					params.where?.id === mockRateType.id ? mockRateType : null,
				findUnique: async (params: Prisma.RateTypeFindUniqueArgs) =>
					params.where?.id === mockRateType.id ? mockRateType : null,
				create: async (params: Prisma.RateTypeCreateArgs) => ({
					...mockRateType,
					...params.data,
				}),
				update: async (params: Prisma.RateTypeUpdateArgs) => ({
					...mockRateType,
					...params.data,
				}),
			},
			organization: {
				findUnique: async (params: Prisma.OrganizationFindUniqueArgs) =>
					params.where?.id === mockRateType.organizationId
						? { id: mockRateType.organizationId, name: "Test Org" }
						: null,
				findMany: async (_params: any) => [],
				findFirst: async (params: any) =>
					params.where?.id === mockRateType.organizationId
						? { id: mockRateType.organizationId, name: "Test Org" }
						: null,
			},
			facilityType: {
				findMany: async (_params: any) => [],
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		rateTypeController = controller(prisma as PrismaClient);
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
		it("should return paginated rate types", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await rateTypeController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a rate type", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockRateType.id };
			await rateTypeController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});

		it("should handle non-existent rate type", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await rateTypeController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new rate type", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "Premium Rate",
				description: "Premium pricing rate",
				organizationId: "507f1f77bcf86cd799439013",
			};
			req.body = createData;
			await rateTypeController.create(req as Request, res, next);

			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update rate type details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Updated Standard Rate",
				basePrice: 120.0,
			};
			req.params = { id: mockRateType.id };
			req.body = updateData;
			await rateTypeController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a rate type", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockRateType.id };
			await rateTypeController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});
	});
});
