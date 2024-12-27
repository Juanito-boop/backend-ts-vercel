import pgPromise from 'pg-promise';
import { variablesConexion, database } from '../domain/varDB';
import { opcionesPG } from './opcionConexion';

const pgp = pgPromise(opcionesPG);	
const { DB_NAME } = variablesConexion();
const DATABASE_URL = database();

export const db = pgp({
	connectionString: DATABASE_URL,
	ssl: { rejectUnauthorized: false }
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
