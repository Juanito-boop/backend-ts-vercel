import prisma from '../prisma';
import { Tienda, TiendaCreate } from '../interface/eschemas';
import Result from '../utils/Result';

export default class TiendaDAO {
	public static async addNewStore(data: TiendaCreate): Promise<Result<{ id: string }>> {
		const { nombre, direccion, telefono, propietario } = data;

		const existingStore = await prisma.tiendas.findFirst({
			where: {
				nombre: { equals: nombre, mode: 'insensitive' },
				direccion: { equals: direccion, mode: 'insensitive' },
				telefono: { equals: telefono, mode: 'insensitive' },
				propietario: { equals: propietario, mode: 'insensitive' },
			},
			select: { id: true },
		});

		if (existingStore) {
			return Result.fail('La tienda ya existe');
		}

		try {
			const newStore = await prisma.tiendas.create({
				data: {
					nombre,
					direccion,
					telefono,
					propietario,
				},
				select: { id: true },
			});

			return Result.success({ id: newStore.id });
		} catch (error) {
			return Result.fail(`No se puede crear la tienda, ${error}`);
		}
	}

	public static async fetchStores(): Promise<Result<Tienda[]>> {
		try {
			const stores = await prisma.tiendas.findMany({
				select: {
					id: true,
					nombre: true,
					direccion: true,
					telefono: true,
					propietario: true,
				}
			});

			return Result.success(stores as Tienda[]);
		} catch (error) {
			return Result.fail(`No se puede obtener las tiendas, ${error}`);
		}
	}

	public static async fetchEmployeeCounterStores() {
		try {
			const rawResult = await prisma.$queryRaw<any[]>`
			  SELECT
			    t.id,
			    t.nombre,
			    COUNT(u.id)::integer AS "# empleados"
			  FROM tiendas t
			  JOIN usuarios u ON t.id = u.tienda_id
			  GROUP BY t.id, t.nombre
			  ORDER BY t.id ASC
			`;
			return Result.success(rawResult);

		} catch (error) {
			return Result.fail(`No se puede obtener el contador de empleados, ${error}`);
		}
	}

	public static async filterStoreById(idStore: string): Promise<Result<Tienda | null>> {
		try {
			const store = await prisma.tiendas.findUnique({
				where: {
					id: idStore,
				}
			});

			// Podrías retornar store o null
			return Result.success(store as Tienda | null);
		} catch (error) {
			return Result.fail(`No se puede obtener la tienda, ${error}`);
		}
	}

	public static async updateStore(fieldsToUpdate: Partial<Tienda>, idStore: string): Promise<Result<void>> {
		try {
			const existing = await prisma.tiendas.findUnique({
				where: { id: idStore },
			});

			if (!existing) {
				return Result.fail('Tienda no encontrada');
			}

			const filteredFieldsToUpdate = Object.fromEntries(
				Object.entries(fieldsToUpdate).filter(([_, val]) => val !== undefined && val !== '')
			);

			await prisma.tiendas.update({
				where: { id: idStore },
				data: filteredFieldsToUpdate,
			});

			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede actualizar la tienda, ${error}`);
		}
	}

	public static async deleteStore(idStore: string): Promise<Result<void>> {
		try {
			const existing = await prisma.tiendas.findUnique({
				where: { id: idStore },
			});

			if (!existing) {
				return Result.fail('Tienda no encontrada');
			}

			await prisma.tiendas.delete({
				where: { id: idStore },
			});

			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede eliminar la tienda, ${error}`);
		}
	}
}
