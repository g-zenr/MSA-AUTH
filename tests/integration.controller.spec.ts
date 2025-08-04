import { controller } from "../app/integration/integration.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Integration Controller", () => {
	let integrationController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockIntegration = {
		id: "507f1f77bcf86cd799439024",
		name: "Payment Gateway Integration",
		description: "Integration with external payment processing service",
		provider: "PayPal",
		isDeleted: false,
		records: {
			apiEndpoint: "https://api.paypal.com/v1",
			version: "1.0",
			lastSync: "2024-01-15T10:00:00Z",
			status: "active",
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			integration: {
				findMany: async (_params: Prisma.IntegrationFindManyArgs) => [mockIntegration],
				count: async (_params: Prisma.IntegrationCountArgs) => 1,
				findFirst: async (params: Prisma.IntegrationFindFirstArgs) =>
					params.where?.id === mockIntegration.id ? mockIntegration : null,
				findUnique: async (params: Prisma.IntegrationFindUniqueArgs) =>
					params.where?.id === mockIntegration.id ? mockIntegration : null,
				create: async (params: Prisma.IntegrationCreateArgs) => ({
					...mockIntegration,
					...params.data,
				}),
				update: async (params: Prisma.IntegrationUpdateArgs) => ({
					...mockIntegration,
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

		integrationController = controller(prisma as PrismaClient);
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
		it("should return paginated integrations", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await integrationController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return an integration", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockIntegration.id };
			await integrationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockIntegration.id });
		});

		it("should handle non-existent integration", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await integrationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new integration", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "SMS Service Integration",
				description: "Integration with SMS notification service",
				provider: "Twilio",
				records: {
					apiEndpoint: "https://api.twilio.com/2010-04-01",
					version: "2.0",
					features: ["SMS", "Voice", "WhatsApp"],
				},
			};
			req.body = createData;
			await integrationController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update integration details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Enhanced Payment Gateway Integration",
				description: "Updated integration with additional payment methods",
				records: {
					apiEndpoint: "https://api.paypal.com/v2",
					version: "2.0",
					lastSync: "2024-02-15T10:00:00Z",
					status: "active",
					features: ["PayPal", "Credit Card", "Bank Transfer"],
				},
			};
			req.params = { id: mockIntegration.id };
			req.body = updateData;
			await integrationController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete an integration", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockIntegration.id };
			await integrationController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent integration deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await integrationController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
