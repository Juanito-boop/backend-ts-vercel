import Jwt from 'jsonwebtoken';
import { secretJWT } from '../config/domain/varDB';
import { Token } from '../interface/eschemas';
import Result from '../utils/Result';
import prisma from '../prisma';

export default class tokenDAO {
	public static async generateToken(data: Token[]): Promise<Result<string>> {
		try {
			const { username, password } = data[0];

			const user = await prisma.usuarios.findFirst({
				where: {
					username,
					password,
				},
				select: {
					username: true,
					tienda_id: true,
					rol: true,
				},
			});

			if (!user) {
				return Result.fail('No se encontraron registros');
			}

			const url = this.getUrlByRole(user.rol);

			const secretKey = secretJWT() || 'LaSuperClave';
			const token = Jwt.sign(
				{
					username: user.username,
					tienda_id: user.tienda_id,
					rol: user.rol,
					url,
				},
				secretKey,
				{ expiresIn: '10000d' },
			);

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
