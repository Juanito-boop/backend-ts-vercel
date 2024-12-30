import { Request, Response } from 'express';
import { ProductoUpdateSchema, productoCreateSchema } from '@interface/eschemas';
import productoDAO from '@dao/productoDAO';
import { z } from 'zod';

class ProductoController {
	public async createProduct(req: Request, res: Response): Promise<void> {
		const parseResult = productoCreateSchema.safeParse(req.body);

		if (!parseResult.success) {
			res.status(400).json({
				Respuesta: 'Datos inválidos',
				errors: parseResult.error.errors,
			});
			return;
		}

		const data = parseResult.data;

		const result = await productoDAO.insertProduct(data);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async fetchProducts(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;

		if (!z.string().uuid().safeParse(tienda).success) {
			res.status(400).json({ Respuesta: 'El id de la tienda no es un UUID válido' });
			return;
		}

		const result = await productoDAO.fetchProducts(tienda);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async filterProductById(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const idProducto = req.params.idProducto;

		if (!z.string().uuid().safeParse(tienda).success || !z.string().uuid().safeParse(idProducto).success) {
			res.status(400).json({ Respuesta: 'Los IDs deben ser UUID válidos' });
			return;
		}

		const result = await productoDAO.filterProductById(tienda, idProducto);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async updateProduct(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const idProducto = req.params.idProducto;

		if (!z.string().uuid().safeParse(tienda).success || !z.string().uuid().safeParse(idProducto).success) {
			res.status(400).json({ Respuesta: 'Los IDs deben ser UUID válidos' });
			return;
		}

		const fieldsToUpdate = ProductoUpdateSchema.partial().safeParse(req.body);

		if (!fieldsToUpdate.success) {
			res.status(400).json({
				Respuesta: 'Datos inválidos',
				errors: fieldsToUpdate.error.errors,
			});
			return;
		}

		const result = await productoDAO.updateProduct(fieldsToUpdate.data, idProducto, tienda);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: 'Producto actualizado' });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async productsCounter(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;

		if (!z.string().uuid().safeParse(tienda).success) {
			res.status(400).json({ Respuesta: 'El id de la tienda no es un UUID válido' });
			return;
		}

		const result = await productoDAO.productsCounter(tienda);

		if (result.isSuccess) {
			res.status(200).json({ count: result.getValue() });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public async deleteProduct(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const idProducto = req.params.idProducto;

		if (!z.string().uuid().safeParse(tienda).success || !z.string().uuid().safeParse(idProducto).success) {
			res.status(400).json({ Respuesta: 'Los IDs deben ser UUID válidos' });
			return;
		}

		const result = await productoDAO.deleteProduct(tienda, idProducto);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: 'Producto eliminado' });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}
}

const productoController = new ProductoController();
export default productoController;
