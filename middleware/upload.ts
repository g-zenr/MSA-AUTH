import multer from "multer";
import { Request } from "express";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	// Check if file is an image
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Only image files are allowed!"));
	}
};

// Create multer instance
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit per file
		files: 10, // Maximum 10 files
	},
});

// Export different upload configurations
export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 10); // Maximum 10 images
export const uploadFields = upload.fields([
	{ name: "images", maxCount: 10 },
	{ name: "thumbnails", maxCount: 5 },
]);
export const uploadOrganizationFiles = upload.fields([
	{ name: "logo", maxCount: 1 },
	{ name: "background", maxCount: 1 },
]);

export const uploadUserFiles = upload.fields([{ name: "avatar", maxCount: 1 }]);

// New upload configuration for facility images (1-5 images)
export const uploadFacilityImages = upload.array("images", 5);

// Upload configuration for room type images (multiple images)
export const uploadRoomTypeImages = upload.array("images", 10); // Maximum 10 images for room types

export const uploadFacilityTypeImages = upload.array("images", 10); // Maximum 10 images for facility types

export default upload;
