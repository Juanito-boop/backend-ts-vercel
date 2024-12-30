import prisma from '@src/prisma';
import { Usuario, UsuarioCreate } from '@interface/eschemas';
import Result from '@utils/Result';

export class UsuarioDAO {
	public static async createUser(data: UsuarioCreate): Promise<Result<{ id: string }>> {	
		const { username, password, tienda_id, rol } = data;

		const existingUser = await prisma.usuarios.findFirst({
			where: {
				username: username,
				tienda_id: tienda_id,
			},
			select: { id: true },
		});

		if (existingUser) {
			return Result.fail('El usuario ya existe');
		}

		try {
			const newUser = await prisma.usuarios.create({
				data: {
					username,
					password,
					tienda_id,
					rol,
				},
				select: { id: true },
			});

			return Result.success({ id: newUser.id });
		} catch (error) {
			return Result.fail(`No se puede crear el usuario, ${error}`);
		}
	}

	public static async fetchUsers(tienda_id: string) {
		try {
			const users = await prisma.usuarios.findMany({
				where: { tienda_id },
				select: {
					id: true,
					username: true,
					rol: true,
					tienda_id: true,
					password: false,
				},
			});

			const resultUsers = users.map((u) => ({
				...u
			})) as Usuario[];

			return Result.success(resultUsers);
		} catch (error) {
			return Result.fail(`No se puede obtener los usuarios, ${error}`);
		}
	}

	public static async filterUserByStoreAndId(tienda_id: string, id: string) {
		try {
			// 1) Buscar el usuario
			const user = await prisma.usuarios.findFirst({
				where: {
					id,
					tienda_id,
				},
				select: {
					id: true,
					username: true,
					rol: true,
					tienda_id: false,
					password: false,
				}
			});

			return Result.success(user);
		} catch (error) {
			return Result.fail(`No se puede obtener el usuario, ${error}`);
		}
	}

	public static async updateUser(fieldsToUpdate: { [key: string]: any }, id: string, tienda_id: string) {
		if (Object.keys(fieldsToUpdate).length === 0) {
			return Result.fail('No se proporcionaron campos para actualizar');
		}

		const existingUser = await prisma.usuarios.findFirst({
			where: { id, tienda_id },
		});

		if (!existingUser) {
			return Result.fail('Usuario no encontrado');
		}

		try {
			const filteredFieldsToUpdate = Object.fromEntries(
				Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined && value !== '')
			);

			if (Object.keys(filteredFieldsToUpdate).length === 0) {
				return Result.fail('No se proporcionaron campos válidos para actualizar');
			}

			const updateResult = await prisma.usuarios.updateMany({
				where: {
					id,
					tienda_id,
				},
				data: filteredFieldsToUpdate,
			});

			if (updateResult.count === 0) {
				return Result.fail('No se actualizó ningún usuario');
			}

			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede actualizar el usuario, ${error}`);
		}
	}

	public static async deleteUser(tienda_id: string, id: string) {
		const existingUser = await prisma.usuarios.findFirst({
			where: {
				id,
				tienda_id,
			},
		});

		if (!existingUser) {
			return Result.fail('Usuario no encontrado en la tienda especificada.');
		}

		try {
			const deleteResult = await prisma.usuarios.deleteMany({
				where: {
					id,
					tienda_id,
				},
			});

			if (deleteResult.count === 0) {
				return Result.fail('No se pudo eliminar el usuario, no existe.');
			}

			return Result.success();
		} catch (error: any) {
			const errorMessage = error?.message ? error.message : 'Error desconocido.';
			return Result.fail(`No se pudo eliminar el usuario: ${errorMessage}`);
		}
	}
}