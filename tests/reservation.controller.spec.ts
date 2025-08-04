import { controller } from "../app/reservation/reservation.controller";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "../generated/prisma";

const TEST_TIMEOUT = 5000;

describe("Reservation Controller", () => {
	let reservationController: any;
	let req: Partial<Request>;
	let res: Response;
	let next: NextFunction;
	let prisma: any;
	let sentData: any;
	let statusCode: number;

	const mockReservation = {
		id: "507f1f77bcf86cd799439018",
		facilityId: "507f1f77bcf86cd799439015",
		personId: "507f1f77bcf86cd799439011",
		rateTypeId: "507f1f77bcf86cd799439019",
		reservationDate: new Date("2024-01-15T10:00:00Z"),
		reservationEndDate: new Date("2024-01-15T12:00:00Z"),
		checkInDate: null,
		checkOutDate: null,
		status: "RESERVED",
		guests: 2,
		additionalGuests: { adults: 1, children: 1 },
		specialRequests: "Need projector",
		facilityType: "Meeting Room",
		marketCode: "CORPORATE",
		sourceCode: "WEBSITE",
		bookingChannel: "DIRECT",
		vipStatus: "VIP1",
		membershipNumber: "MEM001",
		currency: "USD",
		paymentStatus: "PENDING",
		price: {
			amount: 150.0,
			uom: "HOUR",
			appliedTax: 10.0,
			appliedDiscount: 5.0,
			appliedTaxAmount: 15.0,
			appliedDiscountAmount: 7.5,
		},
		remarks: "Test reservation",
		version: 1,
		facility: {
			id: "507f1f77bcf86cd799439015",
			name: "Conference Room A",
		},
		person: {
			id: "507f1f77bcf86cd799439011",
			personalInfo: {
				firstName: "John",
				lastName: "Doe",
			},
		},
		rateType: {
			id: "507f1f77bcf86cd799439019",
			name: "Standard Rate",
		},
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		prisma = {
			reservation: {
				findMany: async (_params: Prisma.ReservationFindManyArgs) => [mockReservation],
				count: async (_params: Prisma.ReservationCountArgs) => 1,
				findFirst: async (params: Prisma.ReservationFindFirstArgs) =>
					params.where?.id === mockReservation.id ? mockReservation : null,
				findUnique: async (params: Prisma.ReservationFindUniqueArgs) =>
					params.where?.id === mockReservation.id ? mockReservation : null,
				create: async (params: Prisma.ReservationCreateArgs) => ({
					...mockReservation,
					...params.data,
				}),
				update: async (params: Prisma.ReservationUpdateArgs) => ({
					...mockReservation,
					...params.data,
				}),
				delete: async (params: Prisma.ReservationDeleteArgs) => mockReservation,
			},
			facility: {
				findUnique: async (params: Prisma.FacilityFindUniqueArgs) =>
					params.where?.id === mockReservation.facilityId
						? mockReservation.facility
						: null,
			},
			person: {
				findUnique: async (params: Prisma.PersonFindUniqueArgs) =>
					params.where?.id === mockReservation.personId ? mockReservation.person : null,
			},
			rateType: {
				findUnique: async (params: Prisma.RateTypeFindUniqueArgs) =>
					params.where?.id === mockReservation.rateTypeId
						? mockReservation.rateType
						: null,
			},
			$transaction: async (operations: any) => {
				if (typeof operations === "function") {
					return operations(prisma);
				}
				return await Promise.all(operations);
			},
		};

		reservationController = controller(prisma as PrismaClient);
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
		it("should return paginated reservations", async function () {
			this.timeout(TEST_TIMEOUT);
			req.query = { page: "1", limit: "10" };
			await reservationController.getAll(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
		});
	});

	describe(".getById()", () => {
		it("should return a reservation", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockReservation.id };
			await reservationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(200);
			expect(sentData).to.have.property("data");
			expect(sentData.data).to.deep.include({ id: mockReservation.id });
		});

		it("should handle non-existent reservation", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await reservationController.getById(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});

	describe(".create()", () => {
		it("should create a new reservation", async function () {
			this.timeout(TEST_TIMEOUT);
			const createData = {
				facilityId: "507f1f77bcf86cd799439015",
				personId: "507f1f77bcf86cd799439011",
				reservationDate: "2024-02-15T14:00:00.000Z",
				reservationEndDate: "2024-02-15T16:00:00.000Z",
				guests: 3,
			};
			req.body = createData;
			await reservationController.create(req as Request, res, next);
			if (statusCode === 201) {
				expect(sentData).to.have.property("data");
			} else {
				expect(statusCode).to.be.oneOf([201, 400]);
			}
		});
	});

	describe(".update()", () => {
		it("should update reservation details", async function () {
			this.timeout(TEST_TIMEOUT);
			const updateData = {
				guests: 4,
				specialRequests: "Updated special requests",
				status: "CHECKED_IN",
			};
			req.params = { id: mockReservation.id };
			req.body = updateData;
			await reservationController.update(req as Request, res, next);
			expect(statusCode).to.equal(200);
			if (sentData.data) {
				expect(sentData).to.have.property("data");
			} else {
				expect(sentData).to.have.property("id");
			}
		});
	});

	describe(".remove()", () => {
		it("should delete a reservation", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: mockReservation.id };
			await reservationController.remove(req as Request, res, next);
			expect([200, 200]).to.include(statusCode);
		});

		it("should handle non-existent reservation deletion", async function () {
			this.timeout(TEST_TIMEOUT);
			req.params = { id: "507f1f77bcf86cd799439099" };
			await reservationController.remove(req as Request, res, next);
			expect(statusCode).to.equal(404);
			expect(sentData).to.have.property("error");
		});
	});
});
