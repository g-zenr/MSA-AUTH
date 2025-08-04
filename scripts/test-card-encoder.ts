#!/usr/bin/env ts-node

import { cardEncoderService } from "../utils/cardEncoderService";
import { getLogger } from "../helper/logger";

const logger = getLogger();
const testLogger = logger.child({ module: "card-encoder-test" });

async function testCardEncoder() {
	console.log("🧪 Testing Card Encoder Integration...\n");

	try {
		// Test 1: Check bridge availability
		console.log("1. Checking bridge availability...");
		const bridgeAvailable = await cardEncoderService.checkBridgeAvailability();
		console.log(`   Bridge available: ${bridgeAvailable ? "✅ Yes" : "❌ No"}`);

		if (!bridgeAvailable) {
			console.log(
				"   ⚠️  Bridge not found. Make sure CardEncoderBridge.exe exists in the bridge folder.",
			);
			return;
		}

		// Test 2: Test status endpoint (simulated)
		console.log("\n2. Testing status check...");
		const statusResult = await cardEncoderService.checkBridgeAvailability();
		console.log(`   Status check: ${statusResult ? "✅ Success" : "❌ Failed"}`);

		// Test 3: Test connect (with a dummy port)
		console.log("\n3. Testing connect (dummy port)...");
		const connectResult = await cardEncoderService.connect("COM1");
		console.log(`   Connect result: ${connectResult.success ? "✅ Success" : "❌ Failed"}`);
		if (!connectResult.success) {
			console.log(`   Error: ${connectResult.error}`);
		} else {
			console.log(`   Data: ${connectResult.data}`);
		}

		// Test 4: Test disconnect
		console.log("\n4. Testing disconnect...");
		const disconnectResult = await cardEncoderService.disconnect();
		console.log(
			`   Disconnect result: ${disconnectResult.success ? "✅ Success" : "❌ Failed"}`,
		);
		if (!disconnectResult.success) {
			console.log(`   Error: ${disconnectResult.error}`);
		} else {
			console.log(`   Data: ${disconnectResult.data}`);
		}

		console.log("\n🎉 Card Encoder Integration Test Completed!");
		console.log("\n📋 Next Steps:");
		console.log(
			"   1. Ensure CardEncoder.dll is in the same directory as CardEncoderBridge.exe",
		);
		console.log("   2. Test with actual card encoder hardware");
		console.log("   3. Use the API endpoints:");
		console.log("      - POST /api/card-encoder/connect");
		console.log("      - POST /api/card-encoder/disconnect");
		console.log("      - GET /api/card-encoder/status");
	} catch (error) {
		console.error("❌ Test failed:", error);
	}
}

// Run the test
testCardEncoder().catch(console.error);
