import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import {
	uploadImage,
	uploadMultipleImages,
	deleteImage,
	deleteMultipleImages,
	getTransformedImageUrl,
} from "../../helper/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { config } from "../../config/constant";

export interface ImagesController {
	uploadSingle: (req: Request, res: Response) => Promise<void>;
	uploadMultiple: (req: Request, res: Response) => Promise<void>;
	deleteImage: (req: Request, res: Response) => Promise<void>;
	deleteMultiple: (req: Request, res: Response) => Promise<void>;
	getTransformedImage: (req: Request, res: Response) => Promise<void>;
}

export const controller = (prisma: PrismaClient): ImagesController => {
	/**
	 * Upload a single image
	 */
	const uploadSingle = async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.file) {
				res.status(400).json({
					success: false,
					message: config.ERROR.IMAGE.NO_IMAGE_PROVIDED,
				});
				return;
			}

			const { folder } = req.body;

			const uploadOptions = {
				folder: folder || "uploads",
				quality: "auto",
			};

			const result = await uploadImage(req.file.buffer, uploadOptions);

			res.status(200).json({
				success: true,
				message: config.SUCCESS.IMAGE.UPLOADED,
				data: {
					public_id: result.public_id,
					url: result.secure_url,
					width: result.width,
					height: result.height,
					format: result.format,
					bytes: result.bytes,
					created_at: result.created_at,
				},
			});
		} catch (error: any) {
			console.error("Error uploading single image:", error);
			res.status(500).json({
				success: false,
				message: config.ERROR.IMAGE.UPLOAD_FAILED,
				error: error.message,
			});
		}
	};

	/**
	 * Upload multiple images
	 */
	const uploadMultiple = async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
				res.status(400).json({
					success: false,
					message: config.ERROR.IMAGE.NO_IMAGE_PROVIDED,
				});
				return;
			}

			const { folder } = req.body;

			const uploadOptions = {
				folder: folder || "uploads",
				quality: "auto",
			};

			const fileBuffers = req.files.map((file: Express.Multer.File) => file.buffer);
			const results = await uploadMultipleImages(fileBuffers, uploadOptions);

			const responseData = results.map((result: UploadApiResponse) => ({
				public_id: result.public_id,
				url: result.secure_url,
				width: result.width,
				height: result.height,
				format: result.format,
				bytes: result.bytes,
				created_at: result.created_at,
			}));

			res.status(200).json({
				success: true,
				message: `${results.length} ${config.SUCCESS.IMAGE.MULTIPLE_UPLOADED}`,
				data: responseData,
				count: results.length,
			});
		} catch (error: any) {
			console.error("Error uploading multiple images:", error);
			res.status(500).json({
				success: false,
				message: config.ERROR.IMAGE.UPLOAD_FAILED,
				error: error.message,
			});
		}
	};

	/**
	 * Delete a single image
	 */
	const deleteImageHandler = async (req: Request, res: Response): Promise<void> => {
		try {
			const { publicId } = req.params;

			if (!publicId) {
				res.status(400).json({
					success: false,
					message: config.ERROR.IMAGE.PUBLIC_ID_REQUIRED,
				});
				return;
			}

			const result = await deleteImage(publicId);

			if (result.result === "ok") {
				res.status(200).json({
					success: true,
					message: config.SUCCESS.IMAGE.DELETED,
					data: result,
				});
			} else {
				res.status(404).json({
					success: false,
					message: config.ERROR.IMAGE.NOT_FOUND,
					data: result,
				});
			}
		} catch (error: any) {
			console.error("Error deleting image:", error);
			res.status(500).json({
				success: false,
				message: config.ERROR.IMAGE.DELETE_FAILED,
				error: error.message,
			});
		}
	};

	/**
	 * Delete multiple images
	 */
	const deleteMultiple = async (req: Request, res: Response): Promise<void> => {
		try {
			const { publicIds } = req.body;

			if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
				res.status(400).json({
					success: false,
					message: config.ERROR.IMAGE.PUBLIC_IDS_REQUIRED,
				});
				return;
			}

			const result = await deleteMultipleImages(publicIds);

			res.status(200).json({
				success: true,
				message: `${config.SUCCESS.IMAGE.DELETION_COMPLETED} for ${publicIds.length} images`,
				data: result,
			});
		} catch (error: any) {
			console.error("Error deleting multiple images:", error);
			res.status(500).json({
				success: false,
				message: config.ERROR.IMAGE.DELETE_FAILED,
				error: error.message,
			});
		}
	};

	/**
	 * Get transformed image URL
	 */
	const getTransformedImage = async (req: Request, res: Response): Promise<void> => {
		try {
			const { publicId } = req.params;
			const { width, height, crop, quality, format, effect } = req.query;

			if (!publicId) {
				res.status(400).json({
					success: false,
					message: config.ERROR.IMAGE.PUBLIC_ID_REQUIRED,
				});
				return;
			}

			const transformations: any = {};

			if (width) transformations.width = parseInt(width as string);
			if (height) transformations.height = parseInt(height as string);
			if (crop) transformations.crop = crop;
			if (quality) transformations.quality = quality;
			if (format) transformations.format = format;
			if (effect) transformations.effect = effect;

			const transformedUrl = getTransformedImageUrl(publicId, transformations);

			res.status(200).json({
				success: true,
				message: config.SUCCESS.IMAGE.TRANSFORMED,
				data: {
					public_id: publicId,
					transformed_url: transformedUrl,
					transformations: transformations,
				},
			});
		} catch (error: any) {
			console.error("Error generating transformed image URL:", error);
			res.status(500).json({
				success: false,
				message: config.ERROR.IMAGE.TRANSFORM_FAILED,
				error: error.message,
			});
		}
	};

	return {
		uploadSingle,
		uploadMultiple,
		deleteImage: deleteImageHandler,
		deleteMultiple,
		getTransformedImage,
	};
};
