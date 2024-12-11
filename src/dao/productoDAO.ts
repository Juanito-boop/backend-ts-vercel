import pool from '../config/connection/conexion';
import { Producto, ProductoCreationResult } from '../interface/interfaces';
import { SQL_PRODUCTOS } from '../repository/crudSQL';
import Result from '../utils/Result';

export default class productoDAO {
	public static async insertProduct(data: Producto[]): Promise<Result<ProductoCreationResult>> {
		try {
			const existingProduct = await pool.oneOrNone(SQL_PRODUCTOS.isProductDuplicate, data);

			if (existingProduct?.cantidad > 0) {
				return Result.fail("El producto ya existe");
			}

			const result: ProductoCreationResult = await pool.task(async (consulta) => {
				return await consulta.one<ProductoCreationResult>(SQL_PRODUCTOS.CREAR, data);
			});

			return Result.success({ id_producto: result.id_producto });
		} catch (error) {
			return Result.fail(`No se puede crear el producto, ${error}`);
		}
	}

	public static async fetchProducts(tienda: string): Promise<Result<any[]>> {
  try {
    const rows = await pool.manyOrNone(SQL_PRODUCTOS.getProductsByStoreId, [tienda]);

    const respuesta = rows.map((row: any) => {
      return {
        id: row.id,
        nombre: row.nombre,
        marca: row.marca,
        precio_unitario: parseFloat(row.precio_unitario),
        descripcion: row.descripcion,
        stock: row.stock,
        categoria: {
          categoria_id: row.categoria_id,
          nombre: row.categoria_nombre
        },
        tienda: {
          tienda_id: row.tienda_id,
          nombre: row.tienda_nombre
        }
      }
    });

    return Result.success(respuesta);
  } catch (error: any) {
    return Result.fail(error);
  }
}

	public static async productsCounter(tienda: string): Promise<Result<number>> {
    try {
        // Si la consulta devuelve un objeto { count: "1" }, lo asignamos a respuesta
        const respuesta = await pool.one<{ count: string }>(SQL_PRODUCTOS.countProducts, tienda);
        // Convertimos la cadena a número
        const countNumber = Number(respuesta.count);
        return Result.success(countNumber);
    } catch (error) {
        return Result.fail(`No se puede contar los productos, ${error}`);
    }
}

	public static async filterProductById(tienda: number, idProducto: number): Promise<Result<Producto | null>> {
		try {
			const respuesta: Producto | null = await pool.oneOrNone<Producto>(SQL_PRODUCTOS.LISTARPORID, [tienda, idProducto]);
			return Result.success(respuesta);
		} catch (error) {
			return Result.fail(`No se puede listar el producto, ${error}`);
		}
	}

	public static async updateProduct(fieldsToUpdate: Partial<Producto>, producto_id: string, tienda: string): Promise<Result<void>> {
		if (Object.keys(fieldsToUpdate).length === 0) {
			return Result.fail("No se proporcionaron campos para actualizar");
		}

		// Obtén el producto existente
		const existingProduct = await pool.oneOrNone(
			"SELECT * FROM productos WHERE id = $1 AND tienda_id = $2",
			[producto_id, tienda]
		);

		if (!existingProduct) {
			return Result.fail("Producto no encontrado");
		}

		// Verifica si hay cambios
		const hasChanges = Object.keys(fieldsToUpdate).some(
			(key) => fieldsToUpdate[key as keyof Producto] !== existingProduct[key]
		);

		if (!hasChanges) {
			return Result.fail("No hay cambios en los datos. Actualización innecesaria.");
		}

		try {
			const setClause = Object.keys(fieldsToUpdate)
				.map((field, index) => `${field} = $${index + 1}`)
				.join(", ");

			const values = [...Object.values(fieldsToUpdate), producto_id, tienda];

			const query = `
				UPDATE productos
				SET ${setClause}
				WHERE id = $${Object.keys(fieldsToUpdate).length + 1} AND tienda_id = $${Object.keys(fieldsToUpdate).length + 2}
			`;

			await pool.query(query, values);
			return Result.success();
		} catch (error) {
				return Result.fail(`No se puede actualizar el producto, ${error}`);
		}
	}


	public static async deleteProduct(tienda: string, idProducto: string): Promise<Result<void>> {
		const existingProduct = await pool.oneOrNone(SQL_PRODUCTOS.checkProductExists, [tienda, idProducto]);

		if (!existingProduct) {
			return Result.fail("Producto no encontrado");
		}

		try {
			await pool.query(SQL_PRODUCTOS.ELIMINAR, idProducto);
			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede eliminar el producto, ${error}`);
		}
	}
}