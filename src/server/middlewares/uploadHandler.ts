import { randomUUID } from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError, Status } from '@exceptions/AppError';
import logger from '@config/logger';

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOADS_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDir);
	},
	filename: (_, file, cb) => {
		const uniqueName = randomUUID() + path.extname(file.originalname);
		cb(null, uniqueName);
	}
});

// Configure multer with file size limits and file type validation
export const uploadHandler = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB limit
	},
	fileFilter: (_, file, cb) => {
		// Allow common image and document types
		const allowedTypes = ['image/', 'application/pdf', 'text/plain'];
		logger.info(`File Type : ${file.mimetype}`);
		const matchedMime = allowedTypes.filter((mt) => {
			return file.mimetype.startsWith(mt);
		});

		if (matchedMime.length >= 1) {
			return cb(null, true);
		} else {
			cb(
				new AppError(
					'Invalid file type. Only images, pdf and text files are allowed.',
					Status.BAD_REQUEST
				)
			);
		}
	}
});

export default uploadHandler;
