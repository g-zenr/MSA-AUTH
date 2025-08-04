#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import yaml from "yaml";
import openApiSpecs from "../docs/openApiSpecs";

// Define OpenAPI spec interface
interface OpenAPISpec {
	info?: {
		title?: string;
		version?: string;
	};
	paths?: Record<string, any>;
	components?: Record<string, any>;
}

/**
 * Script to export OpenAPI documentation as JSON and YAML files
 * Usage: npm run export-docs
 */

async function exportOpenApiDocs() {
	try {
		console.log("🚀 Generating OpenAPI documentation...");

		// Generate the OpenAPI specification
		const apiSpec = openApiSpecs() as OpenAPISpec;

		// Create output directory if it doesn't exist
		const outputDir = path.join(process.cwd(), "docs", "generated");
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Export as JSON
		const jsonPath = path.join(outputDir, "swagger.json");
		fs.writeFileSync(jsonPath, JSON.stringify(apiSpec, null, 2));
		console.log(`✅ JSON exported to: ${jsonPath}`);

		// Export as YAML
		const yamlPath = path.join(outputDir, "swagger.yaml");
		const yamlContent = yaml.stringify(apiSpec);
		fs.writeFileSync(yamlPath, yamlContent);
		console.log(`✅ YAML exported to: ${yamlPath}`);

		// Export as OpenAPI JSON (alternative naming)
		const openApiJsonPath = path.join(outputDir, "openapi.json");
		fs.writeFileSync(openApiJsonPath, JSON.stringify(apiSpec, null, 2));
		console.log(`✅ OpenAPI JSON exported to: ${openApiJsonPath}`);

		// Export as OpenAPI YAML (alternative naming)
		const openApiYamlPath = path.join(outputDir, "openapi.yaml");
		fs.writeFileSync(openApiYamlPath, yamlContent);
		console.log(`✅ OpenAPI YAML exported to: ${openApiYamlPath}`);

		console.log("\n📊 Documentation Summary:");
		console.log(`   Title: ${apiSpec.info?.title || "N/A"}`);
		console.log(`   Version: ${apiSpec.info?.version || "N/A"}`);
		console.log(`   Paths: ${Object.keys(apiSpec.paths || {}).length}`);
		console.log(`   Components: ${Object.keys(apiSpec.components || {}).length}`);

		console.log("\n🎉 Export completed successfully!");
	} catch (error) {
		console.error("❌ Error exporting OpenAPI documentation:", error);
		process.exit(1);
	}
}

// Run the export if this script is executed directly
if (require.main === module) {
	exportOpenApiDocs();
}

export default exportOpenApiDocs;
