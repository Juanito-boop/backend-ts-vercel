import { db } from '../config/connection/conexion';
import { Tienda } from '../interface/eschemas';
import { SQL_TIENDAS } from '../repository/crudSQL';
import Result from '../utils/Result';

export default class TiendaDAO {
	public static async addNewStore(data: Omit<Tienda, 'id'>): Promise<Result<any>> {
		const { nombre, direccion, telefono, propietario } = data;

		const existingStore = await db.oneOrNone(SQL_TIENDAS.isStoreDuplicate, [nombre, direccion, telefono, propietario]);

		if (existingStore?.exists) {
			return Result.fail('La tienda ya existe');
		}

		try {
			const result = await db.one(SQL_TIENDAS.createStore, [nombre, direccion, telefono, propietario]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede crear la tienda, ${error}`);
		}
	}

	public static async fetchStores(): Promise<Result<Tienda[]>> {
		try {
			const result: Tienda[] = await db.manyOrNone(SQL_TIENDAS.getStores);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener las tiendas, ${error}`);
		}
	}

	public static async fetchEmployeeCounterStores(limit: number, offset: number): Promise<Result<any[]>> {
		try {
			const result = await db.manyOrNone(SQL_TIENDAS.employeeCounter, [limit, offset]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener el contador de empleados, ${error}`);
		}
	}

	public static async filterStoreById(idStore: string): Promise<Result<Tienda | null>> {
		try {
			const result: Tienda | null = await db.oneOrNone(SQL_TIENDAS.getStoreById, [idStore]);
			return Result.success(result);
		} catch (error) {
			return Result.fail(`No se puede obtener la tienda, ${error}`);
		}
	}

	public static async updateStore(fieldsToUpdate: Partial<Tienda>, idStore: string): Promise<Result<void>> {
		try {
			const updates = Object.entries(fieldsToUpdate)
				.map(([key, _], index) => `${key} = $${index + 1}`)
				.join(', ');
			const values = [...Object.values(fieldsToUpdate), idStore];

			const sqlUpdate = `
        UPDATE tiendas
        SET ${updates}
        WHERE id = $${values.length};
      `;

			await db.query(sqlUpdate, values);
			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede actualizar la tienda, ${error}`);
		}
	}

	public static async deleteStore(idStore: string): Promise<Result<void>> {
		try {
			const result = await db.result(SQL_TIENDAS.deleteStore, [idStore]);

			if (result.rowCount > 0) {
				return Result.success();
			} else {
				return Result.fail('Tienda no encontrada');
			}
		} catch (error) {
			return Result.fail(`No se puede eliminar la tienda, ${error}`);
		}
	}
}
