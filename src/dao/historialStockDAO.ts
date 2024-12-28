import { HistorialStockItemSchema } from "../interface/eschemas";
import prisma from "../prisma";
import Result from "../utils/Result";

export default class historialStockDAO {
	public static async insertBulkHistorial(
		items: Array<{ producto_id: string; cantidad: number }>
	): Promise<Result<void>> {
		try {
			for (const item of items) {
				HistorialStockItemSchema.parse(item);
			}
			await prisma.historial_stock.createMany({
				data: items,
			});

			return Result.success();
		} catch (error) {
			return Result.fail(`No se pudo insertar el historial: ${(error as Error).message}`);
		}
	}
}