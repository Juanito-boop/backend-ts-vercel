import { Request, Response } from 'express';
import historialStockDAO from '../dao/historialStockDAO';
import { z } from 'zod';

export default class HistorialStockController {
	public static async bulkInsert(req: Request, res: Response) {
		const items = req.body as Array<{ producto_id: string; cantidad: number }>;
		
		if (!z.array(z.object({ producto_id: z.string().uuid(), cantidad: z.number() })).safeParse(items).success) {
			return res.status(400).json({ error: 'Datos inválidos' });
		}

		const result = await historialStockDAO.insertBulkHistorial(items);
		if (!result.isSuccess) {
			return res.status(400).json({ error: result.getError() });
		}
		return res.json({ message: 'Registros insertados con éxito' });
	}
}