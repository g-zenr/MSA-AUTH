// MongoDB initialization script for 1BIS API
// This script runs when the MongoDB container starts for the first time

// Create the main database
db = db.getSiblingDB("1bis_db");

// Create collections that will be used by Prisma
db.createCollection("users");
db.createCollection("persons");
db.createCollection("roles");
db.createCollection("organizations");

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.persons.createIndex({ email: 1 });
db.persons.createIndex({ phone: 1 });
db.roles.createIndex({ name: 1 }, { unique: true });

// Create a default admin user if needed
// Note: This is optional and can be removed if you prefer to seed via Prisma
db.users.insertOne({
	email: "admin@1bis.com",
	username: "admin",
	password: "$2a$10$placeholder.hash.for.admin.password", // This should be properly hashed
	role: "admin",
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
});

// Create default roles
db.roles.insertMany([
	{
		name: "admin",
		description: "Administrator with full access",
		permissions: ["*"],
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: "user",
		description: "Standard user",
		permissions: ["read:own", "write:own"],
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: "manager",
		description: "Manager with elevated permissions",
		permissions: ["read:all", "write:limited"],
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
]);

print("1BIS API database initialized successfully!");
