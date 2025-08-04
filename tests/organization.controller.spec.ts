import { controller } from "../app/organization/organization.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Organization Controller", () => {
	let organizationController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockOrganization = {
		id: "507f1f77bcf86cd799439013",
		name: "Test Organization",
		description: "A test organization",
		code: "TEST_ORG",
		branding: {
			logo: "https://example.com/logo.png",
			background: "https://example.com/bg.png",
			font: "Arial",
			colors: {
				primary: "#007bff",
				secondary: "#6c757d",
				accent: "#28a745",
			},
		},
		integrations: [
			{
				integrationId: "507f1f77bcf86cd799439014",
				configuration: { apiKey: "test-key" },
				isActive: true,
			},
		],
		apps: [],
		isDeleted: false,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			organization: {
				findMany: async (_params: Prisma.OrganizationFindManyArgs) => [mockOrganization],
				count: async (_params: Prisma.OrganizationCountArgs) => 1,
				findFirst: async (params: Prisma.OrganizationFindFirstArgs) =>
					params.where?.id === mockOrganization.id ? mockOrganization : null,
				findUnique: async (params: Prisma.OrganizationFindUniqueArgs) =>
					params.where?.id === mockOrganization.id ? mockOrganization : null,
				create: async (params: Prisma.OrganizationCreateArgs) => ({
					...mockOrganization,
					...params.data,
				}),
				update: async (params: Prisma.OrganizationUpdateArgs) => ({
					...mockOrganization,
					...params.data,
				}),
			},
			app: {
				findMany: async (_params: any) => [],
			},
			module: {
				findMany: async (_params: any) => [],
			},
			user: {
				findMany: async (_params: any) => [],
			},
			facility: {
				findMany: async (_params: any) => [],
			},
			facilityLocation: {
				findMany: async (_params: any) => [],
			},
			facilityType: {
				findMany: async (_params: any) => [],
			},
			rateType: {
				findMany: async (_params: any) => [],
			},
			integration: {
				findUnique: async (_params: any) => null,
				findMany: async (_params: any) => [],
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		organizationController = controller(prisma as PrismaClient);
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
		it("should return paginated organizations", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await organizationController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return an organization", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockOrganization.id };
			await organizationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockOrganization.id });
		});

		it("should handle non-existent organization", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await organizationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new organization", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "New Organization",
				description: "A new test organization",
				code: "NEW_ORG",
				branding: {
					logo: "https://example.com/new-logo.png",
					colors: {
						primary: "#ff6b6b",
					},
				},
			};
			req.body = createData;
			await organizationController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update organization details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Updated Organization",
				description: "Updated description",
			};
			req.params = { id: mockOrganization.id };
			req.body = updateData;
			await organizationController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete an organization", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockOrganization.id };
			await organizationController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent organization deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await organizationController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
