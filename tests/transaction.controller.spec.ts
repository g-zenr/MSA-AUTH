import { controller } from "../app/transaction/transaction.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Transaction Controller", () => {
	let transactionController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockTransaction = {
		id: "507f1f77bcf86cd799439020",
		personId: "507f1f77bcf86cd799439011",
		reservationId: "507f1f77bcf86cd799439018",
		type: "PAYMENT",
		amount: 150.0,
		currency: "PHP",
		status: "COMPLETED",
		provider: "GCASH",
		providerRef: "TXN123456789",
		metadata: {
			reference: "PAY-001",
			notes: "Room reservation payment",
		},
		isDeleted: false,
		person: {
			id: "507f1f77bcf86cd799439011",
			personalInfo: {
				firstName: "John",
				lastName: "Doe",
			},
			contactInfo: {
				email: "john@example.com",
			},
		},
		reservation: {
			id: "507f1f77bcf86cd799439018",
			facilityId: "507f1f77bcf86cd799439015",
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			transaction: {
				findMany: async (_params: Prisma.TransactionFindManyArgs) => [mockTransaction],
				count: async (_params: Prisma.TransactionCountArgs) => 1,
				findFirst: async (params: Prisma.TransactionFindFirstArgs) =>
					params.where?.id === mockTransaction.id ? mockTransaction : null,
				findUnique: async (params: Prisma.TransactionFindUniqueArgs) =>
					params.where?.id === mockTransaction.id ? mockTransaction : null,
				create: async (params: Prisma.TransactionCreateArgs) => ({
					...mockTransaction,
					...params.data,
				}),
				update: async (params: Prisma.TransactionUpdateArgs) => ({
					...mockTransaction,
					...params.data,
				}),
			},
			person: {
				findFirst: async (params: Prisma.PersonFindFirstArgs) =>
					params.where?.id === mockTransaction.personId ? mockTransaction.person : null,
			},
			reservation: {
				findUnique: async (params: Prisma.ReservationFindUniqueArgs) =>
					params.where?.id === mockTransaction.reservationId
						? mockTransaction.reservation
						: null,
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		transactionController = controller(prisma as PrismaClient);
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
		it("should return paginated transactions", async function () {
			this.timeout(TEST_TIMEOUT);
			Object.defineProperty(req, "query", {
				value: { page: 1, limit: 10, documents: "true" },
				writable: true,
			});
			await transactionController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a transaction", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockTransaction.id };
			await transactionController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockTransaction.id });
		});

		it("should handle non-existent transaction", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await transactionController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("status", "error");
		});
	});

	describe(".create()", () => {
		it("should create a new transaction", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				personId: "507f1f77bcf86cd799439011",
				type: "PAYMENT",
				amount: 200.0,
				currency: "PHP",
				status: "PENDING",
				provider: "GCASH",
				providerRef: "TXN987654321",
				metadata: {
					reference: "PAY-002",
				},
			};
			req.body = createData;
			await transactionController.create(req as Request, res, next);
			expect(statusCode).to.equal(201);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".update()", () => {
		it("should update transaction details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				status: "COMPLETED",
				metadata: {
					reference: "PAY-001-UPDATED",
					completedAt: new Date().toISOString(),
				},
			};
			req.params = { id: mockTransaction.id };
			req.body = updateData;
			await transactionController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a transaction", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockTransaction.id };
			await transactionController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent transaction deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await transactionController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("status", "error");
		});
	});
});
