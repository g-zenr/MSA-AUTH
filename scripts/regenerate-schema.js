const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔄 Regenerating Prisma schema and client...");

try {
	// Step 1: Combine schema files
	console.log("📝 Combining schema files...");

	// Read all schema files
	const schemaDir = path.join(__dirname, "../prisma/schema");
	const schemaFiles = ["user.prisma", "person.prisma", "organization.prisma", "role.prisma"];

	let combinedSchema = "";

	// Add the main schema content (generator and datasource)
	const mainSchema = fs.readFileSync(path.join(schemaDir, "schema.prisma"), "utf8");
	combinedSchema += mainSchema + "\n\n";

	// Add each schema file content
	schemaFiles.forEach((file) => {
		const filePath = path.join(schemaDir, file);
		if (fs.existsSync(filePath)) {
			const content = fs.readFileSync(filePath, "utf8");
			combinedSchema += `// From ${file}\n`;
			combinedSchema += content + "\n\n";
		}
	});

	// Fix the output path for the generated schema location
	combinedSchema = combinedSchema.replace(
		'output          = "../generated/prisma"',
		'output          = "."',
	);

	// Write the combined schema to the generated/prisma directory
	const generatedSchemaPath = path.join(__dirname, "../generated/prisma/schema.prisma");
	fs.writeFileSync(generatedSchemaPath, combinedSchema);

	console.log("Combined schema written to:", generatedSchemaPath);

	// Step 2: Generate Prisma client
	console.log("⚙️  Generating Prisma client...");
	execSync("npx prisma generate --schema=generated/prisma/schema.prisma", { stdio: "inherit" });

	console.log("✅ Schema and client regenerated successfully!");
} catch (error) {
	console.error("❌ Error during regeneration:", error.message);
	process.exit(1);
}
