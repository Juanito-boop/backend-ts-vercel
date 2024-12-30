import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

const { JWT_SECRET_KEY, SERVER_PORT, DATABASE_URL } = process.env;

const utilsSchema = z.object({
	JWT_SECRET_KEY: z.string().default('hash'),
	SERVER_PORT: z
		.string()
		.regex(/^\d+$/, 'SERVER_PORT debe ser un número')
		.default('8088')
		.transform((val) => parseInt(val, 10)),
	DATABASE_URL: z.string().default(''),
});

const parsedUtils = utilsSchema.parse({ JWT_SECRET_KEY, SERVER_PORT, DATABASE_URL });

export const secretJWT = () => parsedUtils.JWT_SECRET_KEY;
export const serverPort = () => parsedUtils.SERVER_PORT;