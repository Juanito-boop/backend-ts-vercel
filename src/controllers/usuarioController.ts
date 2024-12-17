import { Request, Response } from 'express';
import { z } from 'zod';
import { UsuarioDAO } from '../dao/usuarioDAO';
import { Usuario, UsuarioSchema } from '../interface/eschemas';
import Result from '../utils/Result';

const UsuarioCreateSchema = UsuarioSchema.omit({ id: true });

class usuarioController {
	public async insertUser(req: Request, res: Response): Promise<void> {
		const parseResult = UsuarioCreateSchema.safeParse(req.body);

		if (!parseResult.success) {
			res.status(400).json({
				Respuesta: 'Invalid input data types',
				errors: parseResult.error.errors,
			});
			return;
		}

		const data = parseResult.data;
		const result: Result<{ id: string }> = await UsuarioDAO.createUser(data);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async insertUsers(req: Request, res: Response): Promise<void> {
		const parseArrayResult = z.array(UsuarioCreateSchema).safeParse(req.body);

		if (!parseArrayResult.success) {
			res.status(400).json({
				Respuesta: 'Datos inválidos',
				errors: parseArrayResult.error.errors,
			});
			return;
		}

		const users = parseArrayResult.data;
		const result: Result<{ created: { id: string }[]; errors: string[] }, string> = await UsuarioDAO.createUsers(users);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json(result.getError());
		}
	}

	public async fetchUsers(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tienda)) {
			res.status(400).json({ Respuesta: 'El id de la tienda no es un UUID válido' });
			return;
		}

		const result = await UsuarioDAO.fetchUsers(tienda);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async findAllUsers(req: Request, res: Response): Promise<void> {
		const result: Result<Omit<Usuario, 'password'>[]> = await UsuarioDAO.finAllUsers();

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async findUser(req: Request, res: Response): Promise<void> {
		const idUsuario = req.params.idUsuario;
		const tienda = req.params.idTienda;

		if (
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tienda) ||
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idUsuario)
		) {
			res.status(400).json({
				Respuesta: 'El id del usuario o de la tienda no es un UUID válido',
			});
			return;
		}

		const result = await UsuarioDAO.filterUserByStoreAndId(tienda, idUsuario);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async patchUser(req: Request, res: Response): Promise<void> {
		const idUsuario = req.params.idUsuario;
		const tienda = req.params.idTienda;
		const fieldsToUpdate = req.body;

		if (
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tienda) ||
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idUsuario)
		) {
			res.status(400).json({
				Respuesta: 'El id del usuario o de la tienda no es un UUID válido',
			});
			return;
		}

		const result = await UsuarioDAO.updateUser(fieldsToUpdate, idUsuario, tienda);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: 'Usuario actualizado' });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async deleteUser(req: Request, res: Response): Promise<void> {
		const idUsuario = req.params.idUsuario;
		const tienda = req.params.idTienda;

		if (
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tienda) ||
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idUsuario)
		) {
			res.status(400).json({
				Respuesta: 'El id del usuario o de la tienda no es un UUID válido',
			});
			return;
		}

		const result = await UsuarioDAO.deleteUser(tienda, idUsuario);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: 'Usuario eliminado' });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}
}

const UsuarioController = new usuarioController();
export default UsuarioController;
