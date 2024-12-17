import { db } from '../config/connection/conexion';
import { Categoria } from '../interface/eschemas';
import { SQL_CATEGORIAS } from '../repository/crudSQL';
import Result from '../utils/Result';

export default class CategoriaDAO {
	public static async insertCategory(data: Omit<Categoria, 'id'>): Promise<Result<any>> {
		const { nombre, descripcion, tienda_id } = data;

		const existingCategory = await db.oneOrNone(SQL_CATEGORIAS.isCategoryDuplicate, [nombre, descripcion, tienda_id]);

		if (existingCategory?.exists) {
			return Result.fail('La categoría ya existe');
		}

		try {
			const result = await db.one(SQL_CATEGORIAS.createCategory, [nombre, descripcion, tienda_id]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede crear la categoría, ${error}`);
		}
	}

	public static async fetchCategories(tienda_id: string): Promise<Result<Categoria[]>> {
		try {
			const result: Categoria[] = await db.manyOrNone(SQL_CATEGORIAS.getCategoriesByStoreId, [tienda_id]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener las categorías, ${error}`);
		}
	}

	public static async filterCategoryIdByStore(tienda_id: string, id_categoria: string): Promise<Result<Categoria | null>> {
		try {
			const result: Categoria | null = await db.oneOrNone(SQL_CATEGORIAS.getCategoriesByStoreAndId, [tienda_id, id_categoria]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener la categoría, ${error}`);
		}
	}

	public static async updateCategory(fieldsToUpdate: Partial<Categoria>, tienda_id: string, id_categoria: string): Promise<Result<any>> {
		try {
			const updates = Object.entries(fieldsToUpdate)
				.map(([key, _], index) => `${key} = $${index + 1}`)
				.join(', ');
			const values = [...Object.values(fieldsToUpdate), id_categoria, tienda_id];

			const sqlUpdate = `
        UPDATE categorias
        SET ${updates}
        WHERE id = $${values.length - 1} AND tienda_id = $${values.length}
        RETURNING *;
      `;

			const result = await db.one(sqlUpdate, values);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede actualizar la categoría, ${error}`);
		}
	}

	public static async deleteCategory(tienda_id: string, id_categoria: string): Promise<Result<void>> {
		try {
			const result = await db.result(SQL_CATEGORIAS.deleteCategory, [id_categoria, tienda_id]);

			if (result.rowCount > 0) {
				return Result.success();
			} else {
				return Result.fail('Categoría no encontrada');
			}
		} catch (error) {
			return Result.fail(`No se puede eliminar la categoría, ${error}`);
		}
	}
}
