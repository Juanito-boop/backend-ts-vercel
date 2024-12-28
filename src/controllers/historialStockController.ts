import { Request, Response } from 'express';
import historialStockDAO from '../dao/historialStockDAO';

export default class HistorialStockController {
	public static async bulkInsert(req: Request, res: Response) {
		const items = req.body as Array<{ producto_id: string; cantidad: number }>;

		const result = await historialStockDAO.insertBulkHistorial(items);
		if (!result.isSuccess) {
			return res.status(400).json({ error: result.getError() });
		}
		return res.json({ message: 'Registros insertados con éxito' });
	}
}
