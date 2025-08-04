import { z } from "zod";

export const TransactionTypeSchema = z.enum(["CASH_IN", "CASH_OUT", "REIMBURSEMENT", "PAYMENT"]);

export const TransactionStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]);

export const PaymentProviderSchema = z.enum([
	"PAYPAL",
	"STRIPE",
	"DRAGONPAY",
	"PAYMONGO",
	"GCASH",
	"BANK_TRANSFER",
	"CASH",
]);

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");
export const DateTimeSchema = z.string().datetime("Invalid date format").or(z.date());
export const CurrencySchema = z.string().length(3, "Currency must be 3 characters").default("PHP");

export const CreateTransactionSchema = z.object({
	personId: ObjectIdSchema,
	reservationId: ObjectIdSchema.optional(),
	type: TransactionTypeSchema,
	amount: z.number().positive("Amount must be positive"),
	currency: CurrencySchema.optional().default("PHP"),
	status: TransactionStatusSchema,
	provider: PaymentProviderSchema,
	providerRef: z.string().min(1, "Provider reference is required"),
	metadata: z.record(z.any()).optional().default({}),
});

export const UpdateTransactionSchema = z.object({
	reservationId: ObjectIdSchema.optional(),
	type: TransactionTypeSchema.optional(),
	amount: z.number().positive("Amount must be positive").optional(),
	currency: CurrencySchema.optional(),
	status: TransactionStatusSchema.optional(),
	provider: PaymentProviderSchema.optional(),
	providerRef: z.string().min(1, "Provider reference is required").optional(),
	metadata: z.record(z.any()).optional(),
});

export const TransactionQuerySchema = z
	.object({
		page: z.number().int().positive().optional().default(1),
		limit: z.number().int().positive().max(100).optional().default(10),
		query: z.string().optional(),
		personId: ObjectIdSchema.optional(),
		reservationId: ObjectIdSchema.optional(),
		type: TransactionTypeSchema.optional(),
		status: TransactionStatusSchema.optional(),
		provider: PaymentProviderSchema.optional(),
		sort: z
			.enum([
				"id",
				"personId",
				"reservationId",
				"type",
				"amount",
				"status",
				"provider",
				"createdAt",
				"updatedAt",
			])
			.optional()
			.default("createdAt"),
		order: z.enum(["asc", "desc"]).optional().default("desc"),
		fields: z.string().optional(),
		filter: z.array(z.string()).optional(),
		includeDeleted: z.boolean().optional().default(false),
	})
	.passthrough();

export const BulkCreateTransactionSchema = z.object({
	transactions: z
		.array(CreateTransactionSchema)
		.min(1, "At least one transaction is required")
		.max(100, "Maximum 100 transactions per request"),
});

export const BulkUpdateTransactionSchema = z.object({
	ids: z
		.array(ObjectIdSchema)
		.min(1, "At least one transaction ID is required")
		.max(100, "Maximum 100 transactions per request"),
	updates: UpdateTransactionSchema,
});

export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;
export type BulkCreateTransactionInput = z.infer<typeof BulkCreateTransactionSchema>;
export type BulkUpdateTransactionInput = z.infer<typeof BulkUpdateTransactionSchema>;
