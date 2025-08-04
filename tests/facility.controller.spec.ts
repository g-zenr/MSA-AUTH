import { controller } from "../app/facility/facility.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Facility Controller", () => {
	let facilityController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockFacility = {
		id: "507f1f77bcf86cd799439015",
		name: "Test Room 101",
		facilityTypeId: "507f1f77bcf86cd799439016",
		facilityLocationId: "507f1f77bcf86cd799439017",
		organizationId: "507f1f77bcf86cd799439013",
		description: "A test facility room",
		operatingHours: {
			monday: { openTime: "08:00", closeTime: "17:00" },
			tuesday: { openTime: "08:00", closeTime: "17:00" },
			wednesday: { openTime: "08:00", closeTime: "17:00" },
			thursday: { openTime: "08:00", closeTime: "17:00" },
			friday: { openTime: "08:00", closeTime: "17:00" },
			saturday: { openTime: "09:00", closeTime: "15:00" },
			sunday: { openTime: "10:00", closeTime: "14:00" },
		},
		metadata: {
			roomNumber: "101",
			floor: "1",
			capacity: 4,
		},
		isDeleted: false,
		isTimeBased: true,
		facilityType: {
			id: "507f1f77bcf86cd799439016",
			name: "Meeting Room",
		},
		facilityLocations: {
			id: "507f1f77bcf86cd799439017",
			name: "Building A",
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			facility: {
				findMany: async (_params: Prisma.FacilityFindManyArgs) => [mockFacility],
				count: async (_params: Prisma.FacilityCountArgs) => 1,
				findFirst: async (params: Prisma.FacilityFindFirstArgs) =>
					params.where?.id === mockFacility.id ? mockFacility : null,
				findUnique: async (params: Prisma.FacilityFindUniqueArgs) =>
					params.where?.id === mockFacility.id ? mockFacility : null,
				create: async (params: Prisma.FacilityCreateArgs) => ({
					...mockFacility,
					...params.data,
				}),
				update: async (params: Prisma.FacilityUpdateArgs) => ({
					...mockFacility,
					...params.data,
				}),
			},
			organization: {
				findUnique: async (params: Prisma.OrganizationFindUniqueArgs) =>
					params.where?.id === mockFacility.organizationId
						? { id: mockFacility.organizationId, name: "Test Org" }
						: null,
			},
			facilityType: {
				findUnique: async (params: Prisma.FacilityTypeFindUniqueArgs) =>
					params.where?.id === mockFacility.facilityTypeId
						? mockFacility.facilityType
						: null,
			},
			facilityLocation: {
				findUnique: async (params: Prisma.FacilityLocationFindUniqueArgs) =>
					params.where?.id === mockFacility.facilityLocationId
						? mockFacility.facilityLocations
						: null,
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		facilityController = controller(prisma as PrismaClient);
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
		it("should return paginated facilities", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await facilityController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a facility", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockFacility.id };
			await facilityController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockFacility.id });
		});

		it("should handle non-existent facility", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await facilityController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new facility", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				name: "New Conference Room",
				facilityTypeId: "507f1f77bcf86cd799439016",
				organizationId: "507f1f77bcf86cd799439013",
				description: "A new conference room",
				isTimeBased: true,
			};
			req.body = createData;
			await facilityController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".update()", () => {
		it("should update facility details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				name: "Updated Room Name",
				description: "Updated description",
			};
			req.params = { id: mockFacility.id };
			req.body = updateData;
			await facilityController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a facility", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockFacility.id };
			await facilityController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent facility deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await facilityController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
