import { db } from '../config/connection/conexion';
import { Producto, ProductosFetched } from '../interface/eschemas';
import { SQL_PRODUCTOS } from '../repository/crudSQL';
import Result from '../utils/Result';

export default class ProductoDAO {
	public static async insertProduct(data: Omit<Producto, 'id'>): Promise<Result<any>> {
		const { nombre, marca, precio_unitario, descripcion, stock, categoria_id, tienda_id } = data;

		const existingProduct = await db.oneOrNone(SQL_PRODUCTOS.isProductDuplicate, [
			nombre,
			marca,
			precio_unitario,
			descripcion,
			stock,
			categoria_id,
			tienda_id,
		]);

		if (existingProduct?.exists) {
			return Result.fail('El producto ya existe');
		}

		try {
			const result = await db.one(SQL_PRODUCTOS.CREAR, [nombre, marca, precio_unitario, descripcion, stock, categoria_id, tienda_id]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede crear el producto, ${error}`);
		}
	}

	public static async fetchProducts(tienda_id: string): Promise<Result<ProductosFetched[]>> {
		try {
			const result = await db.manyOrNone(SQL_PRODUCTOS.getProductsByStoreId, [tienda_id]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener los productos, ${error}`);
		}
	}

	public static async filterProductById(tienda_id: string, id_producto: string): Promise<Result<Producto | null>> {
		try {
			const result: Producto | null = await db.oneOrNone(SQL_PRODUCTOS.checkProductExists, [tienda_id, id_producto]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener el producto, ${error}`);
		}
	}

	public static async updateProduct(fieldsToUpdate: Partial<Producto>, id_producto: string, tienda_id: string): Promise<Result<void>> {
		try {
			const updates = Object.entries(fieldsToUpdate)
				.map(([key, _], index) => `${key} = $${index + 1}`)
				.join(', ');
			const values = [...Object.values(fieldsToUpdate), id_producto, tienda_id];

			const sqlUpdate = `
        UPDATE productos
        SET ${updates}
        WHERE id = $${values.length - 1} AND tienda_id = $${values.length};
      `;

			await db.query(sqlUpdate, values);
			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede actualizar el producto, ${error}`);
		}
	}

	public static async productsCounter(tienda_id: string): Promise<Result<number>> {
		try {
			const result = await db.one<{ count: string }>(SQL_PRODUCTOS.countProducts, [tienda_id]);
			const count = parseInt(result.count, 10); // Convertir el valor recibido de string a número
			return Result.success(count);
		} catch (error) {
			return Result.fail(`No se puede contar los productos, ${error}`);
		}
	}

	public static async deleteProduct(tienda_id: string, id_producto: string): Promise<Result<void>> {
		try {
			const result = await db.result(SQL_PRODUCTOS.ELIMINAR, [id_producto, tienda_id]);

			if (result.rowCount > 0) {
				return Result.success();
			} else {
				return Result.fail('Producto no encontrado');
			}
		} catch (error) {
			return Result.fail(`No se puede eliminar el producto, ${error}`);
		}
	}
}
