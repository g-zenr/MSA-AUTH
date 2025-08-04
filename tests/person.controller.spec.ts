import { controller } from "../app/person/person.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Person Controller", () => {
	let personController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockPerson = {
		id: "507f1f77bcf86cd799439011",
		organizationId: "507f1f77bcf86cd799439013",
		personalInfo: {
			firstName: "John",
			lastName: "Doe",
			dateOfBirth: new Date("1990-01-01"),
			gender: "male",
		},
		contactInfo: {
			email: "john@example.com",
			phones: [
				{
					type: "mobile",
					countryCode: "+1",
					number: "1234567890",
					isPrimary: true,
				},
			],
		},
		identification: {
			type: "passport",
			number: "ABC123456",
			issuingCountry: "US",
		},
		metadata: {
			isActive: true,
			isDeleted: false,
		},
	};

	beforeEach(() => {
		prisma = {
			person: {
				findMany: async (_params: Prisma.PersonFindManyArgs) => [mockPerson],
				count: async (_params: Prisma.PersonCountArgs) => 1,
				findFirst: async (params: Prisma.PersonFindFirstArgs) =>
					params.where?.id === mockPerson.id ? mockPerson : null,
				findUnique: async (params: Prisma.PersonFindUniqueArgs) =>
					params.where?.id === mockPerson.id ? mockPerson : null,
				create: async (params: Prisma.PersonCreateArgs) => ({
					...mockPerson,
					...params.data,
				}),
				update: async (params: Prisma.PersonUpdateArgs) => ({
					...mockPerson,
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

		personController = controller(prisma as PrismaClient);
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
		it("should return paginated persons", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await personController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a person", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockPerson.id };
			await personController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockPerson.id });
		});

		it("should handle non-existent person", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await personController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new person", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				personalInfo: {
					firstName: "Jane",
					lastName: "Smith",
					gender: "female",
				},
				contactInfo: {
					email: "jane@example.com",
				},
			};
			req.body = createData;
			await personController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update person details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				personalInfo: {
					firstName: "Jane",
					lastName: "Smith",
				},
			};
			req.params = { id: mockPerson.id };
			req.body = updateData;
			await personController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a person", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockPerson.id };
			await personController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent person deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await personController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
