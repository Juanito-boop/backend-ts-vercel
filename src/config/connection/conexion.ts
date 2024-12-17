import pgPromise from 'pg-promise';
import { opcionesPG } from './opcionConexion';
import { variablesConexion } from '../domain/varDB';

const pgp = pgPromise(opcionesPG);
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = variablesConexion();

export const db = pgp({
	user: DB_USER,
	password: DB_PASSWORD,
	host: DB_HOST,
	port: DB_PORT,
	database: DB_NAME,
});

db.connect()
	.then((conn) => {
		console.log('Conexión exitosa con DB:', DB_NAME);
		conn.done();
	})
	.catch((err) => {
		console.error('Error al conectar con la base de datos:', err);
		process.exit(1);
	});
