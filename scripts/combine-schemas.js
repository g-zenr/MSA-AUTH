const fs = require("fs");
const path = require("path");

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

// Write the combined schema to a temporary file
const tempSchemaPath = path.join(__dirname, "../prisma/combined-schema.prisma");
fs.writeFileSync(tempSchemaPath, combinedSchema);

console.log("Combined schema written to:", tempSchemaPath);
