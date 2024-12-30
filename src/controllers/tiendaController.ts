import { Request, Response } from 'express';
import { TiendaSchema } from '@interface/eschemas';
import tiendaDAO from '@dao/tiendaDAO';
import { z } from 'zod';

const TiendaCreateSchema = TiendaSchema.omit({ id: true });

class TiendaController {
	public async insertStore(req: Request, res: Response): Promise<void> {
		const parseResult = TiendaCreateSchema.safeParse(req.body);

		if (!parseResult.success) {
			res.status(400).json({
				Respuesta: 'Datos inválidos',
				errors: parseResult.error.errors,
			});
			return;
		}

		const data = parseResult.data;
		const result = await tiendaDAO.addNewStore(data);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async fetchStores(_req: Request, res: Response): Promise<void> {
		const result = await tiendaDAO.fetchStores();

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async fetchEmployeeCounterStores(req: Request, res: Response): Promise<void> {
		const result = await tiendaDAO.fetchEmployeeCounterStores();

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async filterStoreById(req: Request, res: Response): Promise<void> {
		const idStore = req.params.idTienda;

		if (!z.string().uuid().safeParse(idStore).success) {
			res.status(400).json({ Respuesta: 'El id de la tienda no es un UUID válido' });
			return;
		}

		const result = await tiendaDAO.filterStoreById(idStore);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async patchStore(req: Request, res: Response): Promise<void> {
		const idTienda = req.params.idTienda;

		if (!z.string().uuid().safeParse(idTienda).success) {
			res.status(400).json({ Respuesta: 'El id de la tienda no es un UUID válido' });
			return;
		}

		const fieldsToUpdate = TiendaSchema.partial().omit({ id: true }).safeParse(req.body);

		if (!fieldsToUpdate.success) {
			res.status(400).json({
				Respuesta: 'Datos inválidos',
				errors: fieldsToUpdate.error.errors,
			});
			return;
		}

		const result = await tiendaDAO.updateStore(fieldsToUpdate.data, idTienda);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: 'Tienda actualizada' });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async deleteStore(req: Request, res: Response): Promise<void> {
		const idTienda = req.params.idTienda;

		if (!z.string().uuid().safeParse(idTienda).success) {
			res.status(400).json({ Respuesta: 'El id de la tienda no es un UUID válido' });
			return;
		}

		const result = await tiendaDAO.deleteStore(idTienda);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: 'Tienda eliminada' });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}
}

const tiendaController = new TiendaController();
export default tiendaController;
