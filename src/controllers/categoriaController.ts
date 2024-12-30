import { Request, Response } from 'express';
import CategoriaDAO from '../dao/categoriaDAO';
import { CategoriaSchema } from '../interface/eschemas';
import { z } from 'zod';

const CategoriaCreateSchema = CategoriaSchema.omit({ id: true });

class CategoriaController {
	public async insertCategory(req: Request, res: Response): Promise<void> {
		const parseResult = CategoriaCreateSchema.safeParse(req.body);

		if (!parseResult.success) {
			res.status(400).json({
				Respuesta: 'Datos inválidos',
				errors: parseResult.error.errors,
			});
			return;
		}

		const data = parseResult.data;
		const result = await CategoriaDAO.insertCategory(data);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async getStoreCategories(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;

		if (!z.string().uuid().safeParse(tienda).success) {
			res.status(400).json({ Respuesta: 'El id de la tienda no es un UUID válido' });
			return;
		}

		const result = await CategoriaDAO.fetchCategories(tienda);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async getFilteredCategoryByStoreAndId(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const idCategoria = req.params.idCategoria;

		if (!z.string().uuid().safeParse(tienda).success || !z.string().uuid().safeParse(idCategoria).success) {
			res.status(400).json({ Respuesta: 'Los IDs deben ser UUID válidos' });
			return;
		}

		const result = await CategoriaDAO.filterCategoryIdByStore(tienda, idCategoria);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async patchStoreCategory(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const idCategoria = req.params.idCategoria;

		if (!z.string().uuid().safeParse(tienda).success || !z.string().uuid().safeParse(idCategoria).success) {
			res.status(400).json({ Respuesta: 'Los IDs deben ser UUID válidos' });
			return;
		}

		const fieldsToUpdate = CategoriaSchema.partial().omit({ id: true }).safeParse(req.body);

		if (!fieldsToUpdate.success) {
			res.status(400).json({
				Respuesta: 'Datos inválidos',
				errors: fieldsToUpdate.error.errors,
			});
			return;
		}

		const result = await CategoriaDAO.updateCategory(fieldsToUpdate.data, tienda, idCategoria);

		if (result.isSuccess) {
			res.status(200).json({
				Respuesta: 'Categoría actualizada con éxito',
				data: result.getValue(),
			});
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async deleteStoreCategoryId(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const idCategoria = req.params.idCategoria;

		if (!z.string().uuid().safeParse(tienda).success || !z.string().uuid().safeParse(idCategoria).success) {
			res.status(400).json({ Respuesta: 'Los IDs deben ser UUID válidos' });
			return;
		}

		const result = await CategoriaDAO.deleteCategory(tienda, idCategoria);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: result.getValue() });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}
}

const categoriaController = new CategoriaController();
export default categoriaController;
