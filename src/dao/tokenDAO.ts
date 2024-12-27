import Jwt from 'jsonwebtoken';
import { db } from '../config/connection/conexion';
import { secretJWT } from '../config/domain/varDB';
import { DataToken } from '../interface/eschemas';
import { Token } from '../interface/eschemas';
import { SQL_TOKEN } from '../repository/crudSQL';
import Result from '../utils/Result';

export default class tokenDAO {
	public static async generateToken(data: Token[]): Promise<Result<string>> {
		try {
			const result = await db.result(SQL_TOKEN.FETCH_USER_CREDENTIALS, data);

			if (result.rows.length === 0) {
				return Result.fail('No se encontraron registros');
			}

			const { username, tienda_id, rol } = result.rows[0] as DataToken;
			const url = this.getUrlByRole(rol);
			(result.rows[0] as DataToken).url = url;
			const secretKey = secretJWT() || 'LaSuperClave';

			const token = Jwt.sign({ username, tienda_id, rol, url }, secretKey, {
				expiresIn: '10000d',
			});

			return Result.success(token);
		} catch (error) {
			return Result.fail(`No se puede generar el token, ${(error as Error).message}`);
		}
	}

	private static getUrlByRole(rol: string): string {
		switch (rol) {
			case 'Administrador':
				return '/dashboard/administrador';
			case 'Cajero':
				return '/dashboard/cajero/facturas';
			default:
				return '/';
		}
	}
}
