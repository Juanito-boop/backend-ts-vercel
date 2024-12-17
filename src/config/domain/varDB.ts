process.loadEnvFile();

import { z } from 'zod';

const { DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD, JWT_SECRET_KEY, SERVER_PORT } = process.env;

const envSchema = z.object({
	DB_HOST: z.string().nonempty('La variable DB_HOST es obligatoria').default('localhost'),
	DB_NAME: z.string().nonempty('La variable DB_NAME es obligatoria').default('postgres'),
	DB_PORT: z
		.string()
		.nonempty('La variable DB_PORT es obligatoria')
		.regex(/^\d+$/, 'DB_PORT debe ser un número')
		.default('5432')
		.transform((val) => parseInt(val, 10)),
	DB_USER: z.string().nonempty('La variable DB_USER es obligatoria').default('camaraDeComercio'),
	DB_PASSWORD: z.string().nonempty('La variable DB_PASSWORD es obligatoria').default('k6uLYdD71aegHwZ'),
});

const utilsSchema = z.object({
	JWT_SECRET_KEY: z.string().default('hash'),
	SERVER_PORT: z
		.string()
		.regex(/^\d+$/, 'SERVER_PORT debe ser un número')
		.default('8088')
		.transform((val) => parseInt(val, 10)),
});

const parsedEnv = envSchema.parse({ DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD });

const parsedUtils = utilsSchema.parse({ JWT_SECRET_KEY, SERVER_PORT });

export const secretJWT = () => parsedUtils.JWT_SECRET_KEY;
export const serverPort = () => parsedUtils.SERVER_PORT;
export const variablesConexion = () => parsedEnv;