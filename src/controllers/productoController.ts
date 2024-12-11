import { Request, Response } from 'express';
import { Producto } from '../interface/interfaces';
import productoDAO from '../dao/productoDAO';

class ProductoController {
	public static async createProduct(req: Request, res: Response): Promise<void> {
		const { nombre, marca, precio_unitario, descripcion, stock, categoria_id, tienda_id } = req.body;
		const data: Producto[] = [ nombre, marca, precio_unitario, descripcion, stock, categoria_id, tienda_id ];
		const result = await productoDAO.insertProduct(data);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public static async productsCounter(req: Request, res: Response): Promise<void> {
    const tienda = req.params.idTienda;

    const result = await productoDAO.productsCounter(tienda);

    if (result.isSuccess) {
        res.status(200).json({ count: result.getValue() });
    } else {
        res.status(400).json({ Respuesta: result.getError() });
    }
}

	public static async fetchProducts(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;

		const result = await productoDAO.fetchProducts(tienda);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public static async filterProductById(req: Request, res: Response): Promise<void> {
		const tienda: number = parseInt(req.params.idTienda);
		const idProducto: number = parseInt(req.params.idProducto);

		if (isNaN(tienda) || isNaN(idProducto)) {
			res.status(400).json({ Respuesta: "El id de la tienda y del producto deben ser números" });
			return;
		}

		const result = await productoDAO.filterProductById(tienda, idProducto);

		if (result.isSuccess) {
			res.status(200).json(result.getValue());
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public static async updateProduct(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const id_producto = req.params.idProducto;
		const fieldsToUpdate: Producto = req.body;

		const result = await productoDAO.updateProduct(fieldsToUpdate, id_producto, tienda);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: "Producto actualizado" });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}

	public static async deleteProduct(req: Request, res: Response): Promise<void> {
		const tienda = req.params.idTienda;
		const idProducto = req.params.idProducto;

		const result = await productoDAO.deleteProduct(tienda, idProducto);

		if (result.isSuccess) {
			res.status(200).json({ Respuesta: "Producto eliminado" });
		} else {
			res.status(400).json({ Respuesta: result.getError() });
		}
	}
}

export default ProductoController;