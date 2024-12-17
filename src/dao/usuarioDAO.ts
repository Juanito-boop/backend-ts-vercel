import { db } from '../config/connection/conexion';
import { Usuario, UsuarioSchema } from '../interface/eschemas';
import { SQL_USUARIO } from '../repository/crudSQL';
import Result from '../utils/Result';
import { z } from 'zod';

const UsuarioCreateSchema = UsuarioSchema.omit({ id: true });
type UsuarioCreate = z.infer<typeof UsuarioCreateSchema>;

export class UsuarioDAO {
	public static async createUser(data: UsuarioCreate): Promise<Result<{ id: string }>> {
		const { username, password, tienda_id, rol } = data;
		const existingUser = await db.oneOrNone(SQL_USUARIO.existUserInStore, [username, tienda_id]);

		if (existingUser?.exists) {
			return Result.fail('El usuario ya existe');
		}

		try {
			const result = await db.task(async (consulta) => {
				return await consulta.one<{ id: string }>(SQL_USUARIO.createUser, [username, password, tienda_id, rol]);
			});

			return Result.success({ id: result.id });
		} catch (error) {
			return Result.fail(`No se puede crear el usuario, ${error}`);
		}
	}

	public static async createUsers(data: UsuarioCreate[]): Promise<Result<{ created: { id: string }[]; errors: string[] }>> {
		const created: { id: string }[] = [];
		const errors: string[] = [];

		for (const user of data) {
			const { username, password, tienda_id, rol } = user;
			const existingUser = await db.oneOrNone(SQL_USUARIO.existUserInStore, [username, tienda_id]);

			if (existingUser) {
				errors.push(`El usuario ${username} ya existe en la tienda ${tienda_id}`);
				continue;
			}

			try {
				const result = await db.task(async (consulta) => {
					return await consulta.one<{ id: string }>(SQL_USUARIO.createUser, [username, password, tienda_id, rol]);
				});
				created.push({ id: result.id });
			} catch (error) {
				errors.push(`No se puede crear el usuario ${username}, ${error}`);
			}
		}
		return Result.success({ created, errors });
	}

	public static async fetchUsers(tienda_id: string): Promise<Result<Usuario[]>> {
		try {
			const result: Usuario[] = await db.manyOrNone(SQL_USUARIO.getUserList, [tienda_id]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener los usuarios, ${error}`);
		}
	}

	public static async finAllUsers(): Promise<Result<Omit<Usuario, 'password'>[]>> {
		try {
			const result: Omit<Usuario, 'password'>[] = await db.manyOrNone(SQL_USUARIO.getAllUsersWithStore);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener los usuarios, ${error}`);
		}
	}

	public static async filterUserByStoreAndId(tienda_id: string, id: string): Promise<Result<Usuario | null>> {
		try {
			const result: Usuario | null = await db.oneOrNone(SQL_USUARIO.findUserByStoreAndId, [id, tienda_id]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener el usuario, ${error}`);
		}
	}

	public static async updateUser(fieldsToUpdate: { [key: string]: any }, id: string, tienda_id: string): Promise<Result<void>> {
		if (Object.keys(fieldsToUpdate).length === 0) {
			return Result.fail('No se proporcionaron campos para actualizar');
		}

		const existingUser = await db.oneOrNone(SQL_USUARIO.findUserByStoreAndId, [id, tienda_id]);

		if (!existingUser) {
			return Result.fail('Usuario no encontrado');
		}

		try {
			const setClause = Object.keys(fieldsToUpdate)
				.map((field, index) => `${field} = $${index + 1}`)
				.join(', ');

			const values = Object.values(fieldsToUpdate);
			values.push(id, tienda_id);

			const sqlUpdate = `UPDATE usuarios SET ${setClause} WHERE id = $${values.length - 1} AND tienda_id = $${values.length}`;

			await db.query(sqlUpdate, values);
			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede actualizar el usuario, ${error}`);
		}
	}

	public static async deleteUser(tienda_id: string, id: string) {
		const existingUser = await db.oneOrNone(SQL_USUARIO.findUserByStoreAndId, [id, tienda_id]);

		if (!existingUser) {
			return Result.fail('Usuario no encontrado en la tienda especificada.');
		}

		try {
			await db.query(SQL_USUARIO.deleteUser, [id, tienda_id]);
			return Result.success();
		} catch (error: any) {
			const errorMessage = error?.message ? error.message : 'Error desconocido.';
			return Result.fail(`No se pudo eliminar el usuario: ${errorMessage}`);
		}
	}
}
