import { controller } from "../app/facilityLocation/facilityLocation.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("FacilityLocation Controller", () => {
	let facilityLocationController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockFacilityLocation = {
		id: "507f1f77bcf86cd799439023",
		building: "Tower A",
		floor: "5F",
		nearby: "Near main elevator",
		notes: "High-traffic area with good accessibility",
		metadata: {
			roomNumber: "A501",
			capacity: 50,
			amenities: ["WiFi", "Projector", "Whiteboard"],
		},
		organizationId: "507f1f77bcf86cd799439013",
		organization: {
			id: "507f1f77bcf86cd799439013",
			name: "Test Organization",
		},
		facilities: [
			{
				id: "507f1f77bcf86cd799439015",
				name: "Conference Room A",
			},
		],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			facilityLocation: {
				findMany: async (_params: Prisma.FacilityLocationFindManyArgs) => [
					mockFacilityLocation,
				],
				count: async (_params: Prisma.FacilityLocationCountArgs) => 1,
				findFirst: async (params: Prisma.FacilityLocationFindFirstArgs) =>
					params.where?.id === mockFacilityLocation.id ? mockFacilityLocation : null,
				findUnique: async (params: Prisma.FacilityLocationFindUniqueArgs) =>
					params.where?.id === mockFacilityLocation.id ? mockFacilityLocation : null,
				create: async (params: Prisma.FacilityLocationCreateArgs) => ({
					...mockFacilityLocation,
					...params.data,
				}),
				update: async (params: Prisma.FacilityLocationUpdateArgs) => ({
					...mockFacilityLocation,
					...params.data,
				}),
				delete: async (params: Prisma.FacilityLocationDeleteArgs) => {
					if (params.where?.id === mockFacilityLocation.id) {
						return { ...mockFacilityLocation, isDeleted: true };
					}
					throw new Error("Record not found");
				},
			},
			organization: {
				findUnique: async (params: Prisma.OrganizationFindUniqueArgs) =>
					params.where?.id === mockFacilityLocation.organizationId
						? mockFacilityLocation.organization
						: null,
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		facilityLocationController = controller(prisma as PrismaClient);
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
		it("should return paginated facility locations", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await facilityLocationController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a facility location", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockFacilityLocation.id };
			await facilityLocationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockFacilityLocation.id });
		});

		it("should handle non-existent facility location", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await facilityLocationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("status", "error");
		});
	});

	describe(".create()", () => {
		it("should create a new facility location", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				building: "Tower B",
				floor: "3F",
				organizationId: "507f1f77bcf86cd799439013",
			};
			req.body = createData;
			// Mock authenticated user
			(req as any).userId = "507f1f77bcf86cd799439012";
			(req as any).organizationId = "507f1f77bcf86cd799439013";
			await facilityLocationController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update facility location details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				building: "Tower A - Renovated",
				notes: "Recently renovated with modern amenities",
				metadata: {
					roomNumber: "A501",
					capacity: 60,
					amenities: ["WiFi", "Smart TV", "Video Conferencing"],
				},
			};
			req.params = { id: mockFacilityLocation.id };
			req.body = updateData;
			await facilityLocationController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a facility location", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockFacilityLocation.id };
			await facilityLocationController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent facility location deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await facilityLocationController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("status", "error");
		});
	});
});
