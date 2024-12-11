import pool from "../config/connection/conexion";
import { Categoria, CategoriaCreationResult, Exists } from "../interface/interfaces";
import { SQL_CATEGORIAS } from "../repository/crudSQL";
import Result from '../utils/Result';

export default class CategoriaDAO {
	public static async insertCategory(data: Categoria[]): Promise<Result<CategoriaCreationResult>> {
		const existingCategory: Exists | null = await pool.oneOrNone(SQL_CATEGORIAS.isCategoryDuplicate, data);

		if (existingCategory?.exists) {
			return Result.fail("La categoria ya existe");
		}

		try {
			const result: CategoriaCreationResult = await pool.task(async (consulta) => {
				return await consulta.one<CategoriaCreationResult>(SQL_CATEGORIAS.createCategory, data);
			});

			return Result.success({ id_categoria: result.id_categoria });
		} catch (error) {
			return Result.fail(`No se puede crear la categoria, ${error}`);
		}
	}

	public static async fetchCategories(tienda: string) {
		try {
			const respuesta: Categoria[] = await pool.manyOrNone(SQL_CATEGORIAS.getCategoriesByStoreId, tienda);
			return Result.success(respuesta);
		} catch (error) {
			return Result.fail(`No se puede listar las categorias de la tienda, ${error}`);
		}
	}

	public static async filterCategoryIdByStore(tienda: number, idCategoria: number) {
		try {
			const respuesta: Categoria | null = await pool.oneOrNone<Categoria>(SQL_CATEGORIAS.getCategoriesByStoreAndId, [tienda, idCategoria]);
			return Result.success(respuesta);
		} catch (error) {
			return Result.fail(`No se puede listar la categoria de la tienda, ${error}`);
		}
	}

	public static async updateCategory(fieldsToUpdate: Partial<Categoria>, tienda: string, idCategoria: string) {
    // Verificar si la categoría existe
    const existingCategory = await pool.oneOrNone(SQL_CATEGORIAS.checkCategoryExists, [tienda, idCategoria]);
    if (!existingCategory) {
      return Result.fail("Categoría no encontrada");
    }
    
    // Filtramos sólo campos válidos que queramos permitir actualizar
    const allowedFields = ["nombre", "descripcion"];
    const updates = Object.entries(fieldsToUpdate)
      .filter(([key, _]) => allowedFields.includes(key));

    if (updates.length === 0) {
      return Result.fail("No se proporcionaron campos válidos para actualizar");
    }

    try {
      const setClause = updates.map(([field], index) => `${field} = $${index + 1}`).join(", ");
      const values = updates.map(([_, value]) => value);

      // Agregamos idCategoria y tienda al final de los valores
      values.push(idCategoria, tienda);

      const sqlUpdate = `
        UPDATE categorias 
        SET ${setClause} 
        WHERE id = $${values.length - 1} 
          AND tienda_id = $${values.length}
        RETURNING *;
      `;

      const updatedCategory = await pool.oneOrNone(sqlUpdate, values);

      if (updatedCategory) {
        return Result.success(updatedCategory);
      } else {
        return Result.fail("No se pudo actualizar la categoría");
      }
    } catch (error: any) {
      return Result.fail(`No se puede actualizar la categoría: ${error.message}`);
    }
  }

	public static async deleteCategory(tienda:number, idCategoria: number) {
		const existingCategory = await pool.oneOrNone(SQL_CATEGORIAS.checkCategoryExists, [tienda, idCategoria]);

		if (!existingCategory) {
			return Result.fail("Categoria no encontrada");
		}

		try {
			const result = await pool.result(SQL_CATEGORIAS.deleteCategory, idCategoria);

			if (result.rowCount > 0) {
				return Result.success("Categoria eliminada");
			} else {
				return Result.fail("Categoria no encontrada");
			}
		} catch (error) {
			return Result.fail(`No se puede eliminar la categoria, ${error}`);
		}
	}
}