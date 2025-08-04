# Card Encoder Integration Guide

This guide explains how to integrate the C# CardEncoderBridge with your Node.js/TypeScript API.

## Overview

The card encoder integration allows your Node.js API to communicate with card encoder hardware through a C# bridge. The bridge acts as a wrapper around the native CardEncoder.dll library, providing a simple command-line interface that your Node.js application can execute.

## Architecture

```
Node.js API ←→ C# Bridge ←→ CardEncoder.dll ←→ Hardware
```

- **Node.js API**: Your main application that handles HTTP requests
- **C# Bridge**: Executable that wraps the CardEncoder.dll functionality
- **CardEncoder.dll**: Native library for card encoder communication
- **Hardware**: Physical card encoder device

## Files Structure

```
bridge/
├── CardEncoderBridge.cs          # C# source code
├── CardEncoderBridge.exe         # Compiled executable
├── CardEncoderBridge.dll         # Native library
├── build-bridge.bat              # Build script
└── README.md                     # Bridge documentation

app/cardEncoder/
├── cardEncoder.controller.ts     # API controller
├── cardEncoder.router.ts         # Express router
└── index.ts                      # Module exports

utils/
└── cardEncoderService.ts         # Service layer

scripts/
└── test-card-encoder.ts          # Test script
```

## Setup

### 1. Prerequisites

- Windows operating system (required for .NET and CardEncoder.dll)
- .NET Runtime installed
- CardEncoder.dll library file
- Card encoder hardware connected

### 2. Build the Bridge

The bridge is automatically built when you start the application:

```bash
npm start
```

Or manually:

```bash
cd bridge
build-bridge.bat
```

### 3. Verify Installation

Test the integration:

```bash
npm run test-card-encoder
```

## API Endpoints

### Connect to Card Encoder

**POST** `/api/card-encoder/connect`

Connect to the card encoder on a specific port.

**Request Body:**

```json
{
	"port": "COM1"
}
```

**Response:**

```json
{
	"success": true,
	"message": "Connected to card encoder successfully",
	"data": "0"
}
```

### Disconnect from Card Encoder

**POST** `/api/card-encoder/disconnect`

Disconnect from the card encoder.

**Response:**

```json
{
	"success": true,
	"message": "Disconnected from card encoder successfully",
	"data": "0"
}
```

### Check Bridge Status

**GET** `/api/card-encoder/status`

Check if the bridge executable is available.

**Response:**

```json
{
	"success": true,
	"data": {
		"bridgeAvailable": true,
		"bridgePath": "bridge/CardEncoderBridge.exe"
	}
}
```

## Usage Examples

### Using the Service Directly

```typescript
import { cardEncoderService } from "../utils/cardEncoderService";

// Connect to card encoder
const connectResult = await cardEncoderService.connect("COM1");
if (connectResult.success) {
	console.log("Connected successfully");
} else {
	console.error("Connection failed:", connectResult.error);
}

// Disconnect
const disconnectResult = await cardEncoderService.disconnect();
if (disconnectResult.success) {
	console.log("Disconnected successfully");
}
```

### Using the API

```javascript
// Connect
const response = await fetch("/api/card-encoder/connect", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: "Bearer YOUR_TOKEN",
	},
	body: JSON.stringify({ port: "COM1" }),
});

const result = await response.json();
console.log(result);
```

## Error Handling

The integration includes comprehensive error handling:

- **Bridge not found**: Returns 503 status when CardEncoderBridge.exe is missing
- **Connection failures**: Returns 500 status with error details
- **Invalid parameters**: Returns 400 status for missing required fields
- **Process errors**: Catches and logs all execution errors

## Security

- All endpoints require authentication (`verifyToken` middleware)
- Only admin and manager roles can access card encoder endpoints
- Bridge execution is sandboxed with proper error handling

## Troubleshooting

### Common Issues

1. **Bridge not found**

    - Ensure CardEncoderBridge.exe exists in the `bridge/` folder
    - Run `npm start` to build the bridge automatically

2. **Connection failed**

    - Check if the port is correct (e.g., COM1, COM2)
    - Verify card encoder hardware is connected
    - Ensure CardEncoder.dll is in the same directory as the executable

3. **Permission denied**

    - Run the application with appropriate permissions
    - Check Windows firewall settings

4. **Port already in use**
    - Disconnect any other applications using the same port
    - Try a different COM port

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
NODE_ENV=development npm start
```

### Testing

Run the test script to verify the integration:

```bash
npm run test-card-encoder
```

## Extending the Integration

### Adding New Commands

1. **Update C# Bridge** (`CardEncoderBridge.cs`):

    ```csharp
    case "newcommand":
        // Add your new command logic
        break;
    ```

2. **Update TypeScript Service** (`cardEncoderService.ts`):

    ```typescript
    async newCommand(param: string): Promise<CardEncoderResult> {
      return this.executeBridge(['newcommand', param]);
    }
    ```

3. **Update Controller** (`cardEncoder.controller.ts`):

    ```typescript
    newCommand: async (req: Request, res: Response, _next: NextFunction) => {
    	// Add controller logic
    };
    ```

4. **Update Router** (`cardEncoder.router.ts`):
    ```typescript
    router.post(
    	"/newcommand",
    	verifyToken,
    	verifyRole(["admin", "manager"]),
    	controller.newCommand,
    );
    ```

### Error Codes

The CardEncoder.dll returns numeric error codes. Common codes:

- `0`: Success
- `1`: Communication error
- `2`: Device not found
- `3`: Port already in use

## Performance Considerations

- Bridge execution is asynchronous and non-blocking
- Each command spawns a new process (consider connection pooling for high-frequency usage)
- Logging is structured and can be filtered by module

## Support

For issues with the card encoder integration:

1. Check the application logs for detailed error messages
2. Verify hardware connections and drivers
3. Test the bridge executable directly from command line
4. Review the CardEncoder.dll documentation for hardware-specific issues
